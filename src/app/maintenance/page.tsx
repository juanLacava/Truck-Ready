"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MaintenancePlanForm } from "@/components/maintenance-plan-form";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type Membership = {
  company_id: string;
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getMaintenanceState(plan: MaintenancePlan) {
  if (plan.trigger_type === "date" && plan.next_due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(`${plan.next_due_date}T00:00:00`);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);

    if (diffDays < 0) {
      return {
        label: "Vencido",
        tone: "bg-rose-100 text-rose-800",
        detail: `${Math.abs(diffDays)} dias de atraso`,
      };
    }

    if (diffDays <= 7) {
      return {
        label: "Proximo",
        tone: "bg-amber-100 text-amber-800",
        detail: diffDays === 0 ? "Toca hoy" : `Faltan ${diffDays} dias`,
      };
    }

    return {
      label: "Al dia",
      tone: "bg-emerald-100 text-emerald-800",
      detail: `Faltan ${diffDays} dias`,
    };
  }

  if (plan.trigger_type === "odometer" && plan.next_due_odometer !== null) {
    const currentOdometer = plan.vehicles?.current_odometer ?? 0;
    const remaining = plan.next_due_odometer - currentOdometer;

    if (remaining < 0) {
      return {
        label: "Vencido",
        tone: "bg-rose-100 text-rose-800",
        detail: `${Math.abs(remaining).toLocaleString("en-US")} mi de atraso`,
      };
    }

    if (remaining <= 1000) {
      return {
        label: "Proximo",
        tone: "bg-amber-100 text-amber-800",
        detail:
          remaining === 0
            ? "Toca ahora"
            : `Faltan ${remaining.toLocaleString("en-US")} mi`,
      };
    }

    return {
      label: "Al dia",
      tone: "bg-emerald-100 text-emerald-800",
      detail: `Faltan ${remaining.toLocaleString("en-US")} mi`,
    };
  }

  return {
    label: "Sin base",
    tone: "bg-slate-100 text-slate-700",
    detail: "Faltan datos para calcular",
  };
}

function formatRule(plan: MaintenancePlan) {
  if (plan.trigger_type === "date") {
    return `Cada ${plan.interval_days ?? "-"} dias`;
  }

  return `Cada ${(plan.interval_km ?? 0).toLocaleString("en-US")} km`;
}

function formatNextDue(plan: MaintenancePlan) {
  if (plan.trigger_type === "date" && plan.next_due_date) {
    return formatDate(plan.next_due_date);
  }

  if (plan.trigger_type === "odometer" && plan.next_due_odometer !== null) {
    return `${plan.next_due_odometer.toLocaleString("en-US")} mi`;
  }

  return "-";
}

export default function MaintenancePage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
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

        const { data: membership, error: membershipError } = await supabase
          .from("company_members")
          .select("company_id")
          .eq("profile_id", session.user.id)
          .limit(1)
          .returns<Membership[]>()
          .maybeSingle();

        if (membershipError) {
          throw membershipError;
        }

        if (!membership) {
          router.replace("/onboarding");
          return;
        }

        const [{ data: vehiclesData, error: vehiclesError }, { data: plansData, error: plansError }] =
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
          ]);

        if (vehiclesError) {
          throw vehiclesError;
        }

        if (plansError) {
          throw plansError;
        }

        if (!isMounted) {
          return;
        }

        setCompanyId(membership.company_id);
        setVehicles(vehiclesData ?? []);
        setPlans(plansData ?? []);
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
    const state = getMaintenanceState(plan);
    return state.label !== "Al dia";
  }).length;

  return (
    <DashboardLayout
      title="Mantenimiento"
      description="Planes preventivos por fecha o kilometraje conectados a las unidades reales de la empresa."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Planes activos</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {activePlans.length}
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Unidades con plan</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {new Set(activePlans.map((plan) => plan.vehicle_id)).size}
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Proximos o vencidos</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {plansNeedingAttention}
          </div>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Unidad</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Proximo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Cargando planes...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-rose-700">
                    {error}
                  </td>
                </tr>
              ) : activePlans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Aun no hay planes de mantenimiento cargados.
                  </td>
                </tr>
              ) : (
                activePlans.map((plan) => {
                  const vehicleLabel =
                    plan.vehicles?.internal_code || plan.vehicles?.plate || "-";
                  const state = getMaintenanceState(plan);

                  return (
                    <tr key={plan.id}>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-medium text-slate-900">{vehicleLabel}</div>
                        <div className="text-xs text-slate-500">
                          {[plan.vehicles?.plate, plan.vehicles?.brand, plan.vehicles?.model]
                            .filter(Boolean)
                            .join(" · ") || "Sin detalle"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-medium text-slate-900">{plan.title}</div>
                        <div className="text-xs text-slate-500">{formatRule(plan)}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{formatNextDue(plan)}</div>
                        <div className="text-xs text-slate-500">{state.detail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${state.tone}`}
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

        {companyId ? (
          <MaintenancePlanForm companyId={companyId} vehicles={vehicles} />
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
