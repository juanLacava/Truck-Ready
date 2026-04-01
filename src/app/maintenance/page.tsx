"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MaintenancePlanForm } from "@/components/maintenance-plan-form";
import { getActiveMembership } from "@/lib/company-membership";
import { formatAlertDate, getMaintenanceAlertState } from "@/lib/alerts";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type Membership = {
  company_id: string;
  created_at: string;
  role: "owner" | "admin" | "operator";
};

type AlertSetting = {
  upcoming_window_days: number;
};

type Vehicle = {
  id: string;
  internal_code: string | null;
  plate: string;
  brand: string | null;
  model: string | null;
  current_odometer: number;
};

type MaintenancePlan = {
  id: string;
  vehicle_id: string;
  title: string;
  trigger_type: "date" | "odometer";
  interval_days: number | null;
  interval_km: number | null;
  last_service_date: string | null;
  last_service_odometer: number | null;
  next_due_date: string | null;
  next_due_odometer: number | null;
  status: "active" | "paused" | "archived";
  vehicles: Vehicle | null;
};

function formatRule(plan: MaintenancePlan) {
  if (plan.trigger_type === "date") {
    return `Cada ${plan.interval_days ?? "-"} dias`;
  }

  return `Cada ${(plan.interval_km ?? 0).toLocaleString("en-US")} km`;
}

function formatNextDue(plan: MaintenancePlan) {
  if (plan.trigger_type === "date" && plan.next_due_date) {
    return formatAlertDate(plan.next_due_date);
  }

  if (plan.trigger_type === "odometer" && plan.next_due_odometer !== null) {
    return `${plan.next_due_odometer.toLocaleString("en-US")} mi`;
  }

  return "-";
}

export default function MaintenancePage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [role, setRole] = useState<Membership["role"] | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [upcomingWindowDays, setUpcomingWindowDays] = useState(15);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPlans() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace("/login");
          return;
        }

        const membership = await getActiveMembership<Membership>(
          supabase,
          session.user.id,
          "company_id, created_at, role"
        );

        if (!membership) {
          router.replace("/onboarding");
          return;
        }

        const [
          { data: vehiclesData, error: vehiclesError },
          { data: plansData, error: plansError },
          { data: settingsData, error: settingsError },
        ] =
          await Promise.all([
            supabase
              .from("vehicles")
              .select("id, internal_code, plate, brand, model, current_odometer")
              .eq("company_id", membership.company_id)
              .order("created_at", { ascending: false })
              .returns<Vehicle[]>(),
            supabase
              .from("maintenance_plans")
              .select(
                "id, vehicle_id, title, trigger_type, interval_days, interval_km, last_service_date, last_service_odometer, next_due_date, next_due_odometer, status, vehicles(id, internal_code, plate, brand, model, current_odometer)"
              )
              .eq("company_id", membership.company_id)
              .neq("status", "archived")
              .order("created_at", { ascending: false })
              .returns<MaintenancePlan[]>(),
            supabase
              .from("company_alert_settings")
              .select("upcoming_window_days")
              .eq("company_id", membership.company_id)
              .returns<AlertSetting[]>()
              .maybeSingle(),
          ]);

        if (vehiclesError) {
          throw vehiclesError;
        }

        if (plansError) {
          throw plansError;
        }

        if (settingsError) {
          throw settingsError;
        }

        if (!isMounted) {
          return;
        }

        setCompanyId(membership.company_id);
        setRole(membership.role);
        setVehicles(vehiclesData ?? []);
        setPlans(plansData ?? []);
        setUpcomingWindowDays(settingsData?.upcoming_window_days ?? 15);
      } catch (loadError) {
        const detail =
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los planes de mantenimiento.";

        if (isMounted) {
          setError(detail);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPlans();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const activePlans = plans.filter((plan) => plan.status === "active");
  const plansNeedingAttention = activePlans.filter((plan) => {
    const state = getMaintenanceAlertState(plan, {
      dateWindowDays: upcomingWindowDays,
    });
    return state.label !== "Al dia";
  }).length;

  return (
    <DashboardLayout
      title="Mantenimiento"
      description="Planes preventivos por fecha o kilometraje para cada unidad de la flota."
    >
      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-600">Planes activos</div>
          <div className="mt-2 text-4xl font-black text-slate-950">
            {activePlans.length}
          </div>
        </article>
        <article className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-600">Unidades</div>
          <div className="mt-2 text-4xl font-black text-slate-950">
            {new Set(activePlans.map((plan) => plan.vehicle_id)).size}
          </div>
        </article>
        <article className={`rounded-2xl border-2 p-6 shadow-sm ${
          activePlans.some((plan) =>
            getMaintenanceAlertState(plan, { dateWindowDays: upcomingWindowDays }).label === "Vencido"
          )
          ? 'border-rose-500 bg-rose-50'
          : 'border-slate-300 bg-white'
        }`}>
          <div className="text-xs font-black uppercase tracking-widest text-slate-600">Por atender</div>
          <div className={`mt-2 text-4xl font-black ${
            activePlans.some((plan) =>
              getMaintenanceAlertState(plan, { dateWindowDays: upcomingWindowDays }).label === "Vencido"
            )
            ? 'text-rose-700'
            : 'text-slate-950'
          }`}>
            {plansNeedingAttention}
          </div>
        </article>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="overflow-hidden rounded-3xl border-2 border-slate-300 bg-white shadow-xl">
          <table className="min-w-full divide-y-2 divide-slate-300 text-sm">
            <thead className="bg-slate-50 text-left text-slate-950 uppercase tracking-widest text-[10px] font-black">
              <tr>
                <th className="px-5 py-4">Unidad</th>
                <th className="px-5 py-4">Plan / Regla</th>
                <th className="px-5 py-4">Proximo</th>
                <th className="px-5 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-800 font-bold">
                    Cargando planes...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-rose-700 font-bold italic">
                    {error}
                  </td>
                </tr>
              ) : activePlans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-600 font-bold">
                    Aun no hay planes de mantenimiento cargados.
                  </td>
                </tr>
              ) : (
                activePlans.map((plan) => {
                  const vehicleLabel =
                    plan.vehicles?.internal_code || plan.vehicles?.plate || "-";
                  const state = getMaintenanceAlertState(plan, {
                    dateWindowDays: upcomingWindowDays,
                  });
                  const isUrgent = state.label === "Vencido";

                  return (
                    <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-5">
                        <div className="font-black text-slate-950 text-base">{vehicleLabel}</div>
                        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                          {plan.vehicles?.plate}
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="font-black text-slate-950 text-base">{plan.title}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          {formatRule(plan)}
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="font-black text-slate-900 leading-none">{formatNextDue(plan)}</div>
                        <div className={`mt-1 text-[11px] font-bold ${isUrgent ? 'text-rose-700' : 'text-slate-500'}`}>{state.detail}</div>
                      </td>
                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-lg px-3 py-1 text-[11px] font-black uppercase tracking-wider border-2 ${
                            isUrgent ? 'bg-rose-50 border-rose-500 text-rose-900' : 
                            state.label === 'Proximo' ? 'bg-amber-50 border-amber-500 text-amber-900' :
                            'bg-emerald-50 border-emerald-500 text-emerald-900'
                          }`}
                        >
                          {state.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {role === "operator" ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="text-sm font-semibold text-amber-900">
              Tu rol actual es operador. Puedes ver planes, pero no crear ni actualizar mantenimiento.
            </div>
          </div>
        ) : null}

        {companyId ? (
          <MaintenancePlanForm companyId={companyId} vehicles={vehicles} canEdit={role !== "operator"} />
        ) : (
          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-500">
              La empresa aun no esta lista para cargar planes de mantenimiento.
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
