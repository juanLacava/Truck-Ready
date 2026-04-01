"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ExpirationForm } from "@/components/expiration-form";
import { getActiveMembership } from "@/lib/company-membership";
import { formatAlertDate, getExpirationAlertState } from "@/lib/alerts";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type Membership = {
  company_id: string;
  created_at: string;
  role: "owner" | "admin" | "operator";
};

type Vehicle = {
  id: string;
  internal_code: string | null;
  plate: string;
  brand: string | null;
  model: string | null;
};

type ExpirationItem = {
  id: string;
  title: string;
  type: string;
  due_date: string;
  alert_days_before: number;
  status: "active" | "completed" | "archived";
  vehicles: Vehicle | null;
};

export default function ExpirationsPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [role, setRole] = useState<Membership["role"] | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expirations, setExpirations] = useState<ExpirationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadExpirations() {
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

        const [{ data: vehiclesData, error: vehiclesError }, { data: expirationsData, error: expirationsError }] =
          await Promise.all([
            supabase
              .from("vehicles")
              .select("id, internal_code, plate, brand, model")
              .eq("company_id", membership.company_id)
              .order("created_at", { ascending: false })
              .returns<Vehicle[]>(),
            supabase
              .from("expiration_items")
              .select(
                "id, title, type, due_date, alert_days_before, status, vehicles(id, internal_code, plate, brand, model)"
              )
              .eq("company_id", membership.company_id)
              .neq("status", "archived")
              .order("due_date", { ascending: true })
              .returns<ExpirationItem[]>(),
          ]);

        if (vehiclesError) {
          throw vehiclesError;
        }

        if (expirationsError) {
          throw expirationsError;
        }

        if (!isMounted) {
          return;
        }

        setCompanyId(membership.company_id);
        setRole(membership.role);
        setVehicles(vehiclesData ?? []);
        setExpirations(expirationsData ?? []);
      } catch (loadError) {
        const detail =
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los vencimientos.";

        if (isMounted) {
          setError(detail);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadExpirations();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const activeExpirations = expirations.filter((item) => item.status === "active");

  return (
    <DashboardLayout
      title="Vencimientos"
      description="Seguimiento de documentos, permisos y obligaciones legales por unidad."
    >
      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-600">Activos</div>
          <div className="mt-2 text-4xl font-black text-slate-950">
            {activeExpirations.length}
          </div>
        </article>
        <article className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-600">Unidades</div>
          <div className="mt-2 text-4xl font-black text-slate-950">
            {vehicles.length}
          </div>
        </article>
        <article className={`rounded-2xl border-2 p-6 shadow-sm ${
          activeExpirations.some(item => getExpirationAlertState(item.due_date, item.alert_days_before).label === 'Vencido')
          ? 'border-rose-500 bg-rose-50'
          : 'border-slate-300 bg-white'
        }`}>
          <div className="text-xs font-black uppercase tracking-widest text-slate-600">Por atender</div>
          <div className={`mt-2 text-4xl font-black ${
            activeExpirations.some(item => getExpirationAlertState(item.due_date, item.alert_days_before).label === 'Vencido')
            ? 'text-rose-700'
            : 'text-slate-950'
          }`}>
            {
              activeExpirations.filter((item) => {
                const state = getExpirationAlertState(item.due_date, item.alert_days_before);
                return state.label !== "Al dia";
              }).length
            }
          </div>
        </article>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="overflow-hidden rounded-3xl border-2 border-slate-300 bg-white shadow-xl">
          <table className="min-w-full divide-y-2 divide-slate-300 text-sm">
            <thead className="bg-slate-50 text-left text-slate-950 uppercase tracking-widest text-[10px] font-black">
              <tr>
                <th className="px-5 py-4">Unidad</th>
                <th className="px-5 py-4">Vencimiento</th>
                <th className="px-5 py-4">Fecha limite</th>
                <th className="px-5 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-800 font-bold">
                    Cargando vencimientos...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-rose-700 font-bold italic">
                    {error}
                  </td>
                </tr>
              ) : activeExpirations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-600 font-bold">
                    Aun no hay vencimientos cargados.
                  </td>
                </tr>
              ) : (
                activeExpirations.map((expiration) => {
                  const vehicleLabel =
                    expiration.vehicles?.internal_code || expiration.vehicles?.plate || "-";
                  const state = getExpirationAlertState(
                    expiration.due_date,
                    expiration.alert_days_before
                  );
                  const isUrgent = state.label === "Vencido";

                  return (
                    <tr key={expiration.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-5">
                        <div className="font-black text-slate-950 text-base">{vehicleLabel}</div>
                        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                          {expiration.vehicles?.plate}
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="font-black text-slate-950 text-base">{expiration.title}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          {expiration.type}
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="font-black text-slate-900 leading-none">{formatAlertDate(expiration.due_date)}</div>
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
              Tu rol actual es operador. Puedes consultar vencimientos, pero no crear nuevos.
            </div>
          </div>
        ) : null}

        {companyId ? (
          <ExpirationForm companyId={companyId} vehicles={vehicles} canEdit={role !== "operator"} />
        ) : (
          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-500">
              La empresa aun no esta lista para cargar vencimientos.
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
