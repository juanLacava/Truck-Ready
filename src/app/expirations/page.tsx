"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ExpirationForm } from "@/components/expiration-form";
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getExpirationState(dueDate: string, alertDaysBefore: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(`${dueDate}T00:00:00`);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) {
    return {
      label: "Vencido",
      tone: "bg-rose-100 text-rose-800",
      detail: `${Math.abs(diffDays)} dias de atraso`,
    };
  }

  if (diffDays <= alertDaysBefore) {
    return {
      label: "Proximo",
      tone: "bg-amber-100 text-amber-800",
      detail: diffDays === 0 ? "Vence hoy" : `Faltan ${diffDays} dias`,
    };
  }

  return {
    label: "Al dia",
    tone: "bg-emerald-100 text-emerald-800",
    detail: `Faltan ${diffDays} dias`,
  };
}

export default function ExpirationsPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
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
      description="Carga y seguimiento de documentos, permisos y obligaciones con fecha por unidad."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Vencimientos activos</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {activeExpirations.length}
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Unidades con seguimiento</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {vehicles.length}
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Proximos o vencidos</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {
              activeExpirations.filter((item) => {
                const state = getExpirationState(item.due_date, item.alert_days_before);
                return state.label !== "Al dia";
              }).length
            }
          </div>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Unidad</th>
                <th className="px-4 py-3 font-medium">Vencimiento</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Cargando vencimientos...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-rose-700">
                    {error}
                  </td>
                </tr>
              ) : activeExpirations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Aun no hay vencimientos cargados.
                  </td>
                </tr>
              ) : (
                activeExpirations.map((expiration) => {
                  const vehicleLabel =
                    expiration.vehicles?.internal_code || expiration.vehicles?.plate || "-";
                  const vehicleDetail = [expiration.vehicles?.brand, expiration.vehicles?.model]
                    .filter(Boolean)
                    .join(" ");
                  const state = getExpirationState(
                    expiration.due_date,
                    expiration.alert_days_before
                  );

                  return (
                    <tr key={expiration.id}>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-medium text-slate-900">{vehicleLabel}</div>
                        <div className="text-xs text-slate-500">
                          {[expiration.vehicles?.plate, vehicleDetail]
                            .filter(Boolean)
                            .join(" · ") || "Sin detalle"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-medium text-slate-900">{expiration.title}</div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          {expiration.type}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{formatDate(expiration.due_date)}</div>
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
          <ExpirationForm companyId={companyId} vehicles={vehicles} />
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
