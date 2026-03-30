"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ServiceRecordForm } from "@/components/service-record-form";
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
  status: "active" | "paused" | "archived";
};

type ServiceRecord = {
  id: string;
  service_date: string;
  odometer: number | null;
  service_type: string;
  cost: number | null;
  notes: string | null;
  vehicles: {
    internal_code: string | null;
    plate: string;
    brand: string | null;
    model: string | null;
  } | null;
  maintenance_plans: {
    title: string;
  } | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function ServicesPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadServices() {
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

        const [
          { data: vehiclesData, error: vehiclesError },
          { data: plansData, error: plansError },
          { data: servicesData, error: servicesError },
        ] = await Promise.all([
          supabase
            .from("vehicles")
            .select("id, internal_code, plate, brand, model, current_odometer")
            .eq("company_id", membership.company_id)
            .order("created_at", { ascending: false })
            .returns<Vehicle[]>(),
          supabase
            .from("maintenance_plans")
            .select("id, vehicle_id, title, trigger_type, interval_days, interval_km, status")
            .eq("company_id", membership.company_id)
            .eq("status", "active")
            .order("title", { ascending: true })
            .returns<MaintenancePlan[]>(),
          supabase
            .from("service_records")
            .select(
              "id, service_date, odometer, service_type, cost, notes, vehicles(internal_code, plate, brand, model), maintenance_plans(title)"
            )
            .eq("company_id", membership.company_id)
            .order("service_date", { ascending: false })
            .order("created_at", { ascending: false })
            .returns<ServiceRecord[]>(),
        ]);

        if (vehiclesError) {
          throw vehiclesError;
        }

        if (plansError) {
          throw plansError;
        }

        if (servicesError) {
          throw servicesError;
        }

        if (!isMounted) {
          return;
        }

        setCompanyId(membership.company_id);
        setVehicles(vehiclesData ?? []);
        setPlans(plansData ?? []);
        setServices(servicesData ?? []);
      } catch (loadError) {
        const detail =
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los servicios.";

        if (isMounted) {
          setError(detail);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <DashboardLayout
      title="Servicios"
      description="Registro cronologico de mantenimientos realizados y su impacto sobre los planes preventivos."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Servicios registrados</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {services.length}
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Planes vinculables</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {plans.length}
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Unidades disponibles</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {vehicles.length}
          </div>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Unidad</th>
                <th className="px-4 py-3 font-medium">Servicio</th>
                <th className="px-4 py-3 font-medium">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Cargando servicios...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-rose-700">
                    {error}
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Aun no hay servicios registrados.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-4 py-3 text-slate-700">{formatDate(service.service_date)}</td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-medium text-slate-900">
                        {service.vehicles?.internal_code || service.vehicles?.plate || "-"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {[service.vehicles?.plate, service.vehicles?.brand, service.vehicles?.model]
                          .filter(Boolean)
                          .join(" · ") || "Sin detalle"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-medium text-slate-900">{service.service_type}</div>
                      <div className="text-xs text-slate-500">
                        {service.maintenance_plans?.title || "Sin plan vinculado"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div>
                        {service.odometer !== null
                          ? `${service.odometer.toLocaleString("en-US")} mi`
                          : "Sin kilometraje"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {service.cost !== null
                          ? formatCurrency(service.cost)
                          : service.notes || "Sin notas"}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {companyId ? (
          <ServiceRecordForm companyId={companyId} vehicles={vehicles} plans={plans} />
        ) : (
          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-500">
              La empresa aun no esta lista para registrar servicios.
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
