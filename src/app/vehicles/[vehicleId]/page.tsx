"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
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
  year: number | null;
  current_odometer: number;
  status: "active" | "maintenance" | "inactive";
  notes: string | null;
};

type ExpirationItem = {
  id: string;
  title: string;
  due_date: string;
  status: "active" | "completed" | "archived";
};

type MaintenancePlan = {
  id: string;
  title: string;
  trigger_type: "date" | "odometer";
  next_due_date: string | null;
  next_due_odometer: number | null;
  status: "active" | "paused" | "archived";
};

type ServiceRecord = {
  id: string;
  service_date: string;
  service_type: string;
  odometer: number | null;
  cost: number | null;
  notes: string | null;
};

type TimelineItem = {
  id: string;
  date: string;
  title: string;
  type: "service" | "expiration" | "maintenance";
  detail: string;
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

function getTimelineTone(type: TimelineItem["type"]) {
  if (type === "service") {
    return "bg-brand-100 text-brand-900";
  }

  if (type === "expiration") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-emerald-100 text-emerald-800";
}

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [expirations, setExpirations] = useState<ExpirationItem[]>([]);
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadVehicleHistory() {
      try {
        const resolvedParams = await params;
        const currentVehicleId = resolvedParams.vehicleId;
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
          { data: vehicleData, error: vehicleError },
          { data: expirationsData, error: expirationsError },
          { data: plansData, error: plansError },
          { data: servicesData, error: servicesError },
        ] = await Promise.all([
          supabase
            .from("vehicles")
            .select(
              "id, internal_code, plate, brand, model, year, current_odometer, status, notes"
            )
            .eq("company_id", membership.company_id)
            .eq("id", currentVehicleId)
            .returns<Vehicle[]>()
            .maybeSingle(),
          supabase
            .from("expiration_items")
            .select("id, title, due_date, status")
            .eq("company_id", membership.company_id)
            .eq("vehicle_id", currentVehicleId)
            .neq("status", "archived")
            .order("due_date", { ascending: false })
            .returns<ExpirationItem[]>(),
          supabase
            .from("maintenance_plans")
            .select("id, title, trigger_type, next_due_date, next_due_odometer, status")
            .eq("company_id", membership.company_id)
            .eq("vehicle_id", currentVehicleId)
            .neq("status", "archived")
            .order("created_at", { ascending: false })
            .returns<MaintenancePlan[]>(),
          supabase
            .from("service_records")
            .select("id, service_date, service_type, odometer, cost, notes")
            .eq("company_id", membership.company_id)
            .eq("vehicle_id", currentVehicleId)
            .order("service_date", { ascending: false })
            .order("created_at", { ascending: false })
            .returns<ServiceRecord[]>(),
        ]);

        if (vehicleError) {
          throw vehicleError;
        }

        if (expirationsError) {
          throw expirationsError;
        }

        if (plansError) {
          throw plansError;
        }

        if (servicesError) {
          throw servicesError;
        }

        if (!vehicleData) {
          router.replace("/vehicles");
          return;
        }

        if (!isMounted) {
          return;
        }

        setVehicle(vehicleData);
        setExpirations(expirationsData ?? []);
        setPlans(plansData ?? []);
        setServices(servicesData ?? []);
      } catch (loadError) {
        const detail =
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el historial de la unidad.";

        if (isMounted) {
          setError(detail);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadVehicleHistory();

    return () => {
      isMounted = false;
    };
  }, [params, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
          Cargando unidad...
        </div>
      </main>
    );
  }

  if (error || !vehicle) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-800">
          {error ?? "No se pudo cargar la unidad."}
        </div>
      </main>
    );
  }

  const timeline: TimelineItem[] = [
    ...services.map((service) => ({
      id: `service-${service.id}`,
      date: service.service_date,
      title: service.service_type,
      type: "service" as const,
      detail: [
        service.odometer !== null
          ? `${service.odometer.toLocaleString("en-US")} mi`
          : null,
        service.cost !== null ? formatCurrency(service.cost) : null,
        service.notes,
      ]
        .filter(Boolean)
        .join(" · "),
    })),
    ...expirations.map((expiration) => ({
      id: `expiration-${expiration.id}`,
      date: expiration.due_date,
      title: expiration.title,
      type: "expiration" as const,
      detail: `Vencimiento ${expiration.status === "completed" ? "completado" : "programado"}`,
    })),
    ...plans
      .filter((plan) => plan.next_due_date)
      .map((plan) => ({
        id: `maintenance-${plan.id}`,
        date: plan.next_due_date!,
        title: plan.title,
        type: "maintenance" as const,
        detail:
          plan.trigger_type === "date"
            ? "Proximo servicio programado"
            : `Siguiente objetivo: ${plan.next_due_odometer?.toLocaleString("en-US") ?? "-"} mi`,
      })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activeExpirations = expirations.filter((item) => item.status === "active");
  const activePlans = plans.filter((plan) => plan.status === "active");

  return (
    <DashboardLayout
      title={vehicle.internal_code || vehicle.plate}
      description="Resumen operativo y cronologia consolidada de la unidad."
    >
      <div className="mb-6">
        <Link href="/vehicles" className="text-sm text-brand-800 underline">
          Volver a unidades
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Vehiculo</div>
          <div className="mt-3 text-lg font-semibold text-slate-900">
            {[vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(" ") || "-"}
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Placa</div>
          <div className="mt-3 text-lg font-semibold text-slate-900">{vehicle.plate}</div>
        </article>
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Kilometraje</div>
          <div className="mt-3 text-lg font-semibold text-slate-900">
            {vehicle.current_odometer.toLocaleString("en-US")} mi
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Estado</div>
          <div className="mt-3 text-lg font-semibold capitalize text-slate-900">
            {vehicle.status}
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-6">
          <article className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Resumen</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                {expirations.length} vencimientos registrados
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                {plans.length} planes de mantenimiento
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                {services.length} servicios realizados
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                {vehicle.notes || "Sin notas cargadas"}
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Pendientes de la unidad</h2>
            <div className="mt-4 grid gap-3">
              {activeExpirations.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-slate-700">
                  <div className="font-medium text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500">Vence el {formatDate(item.due_date)}</div>
                </div>
              ))}
              {activePlans.slice(0, 3).map((plan) => (
                <div key={plan.id} className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-slate-700">
                  <div className="font-medium text-slate-900">{plan.title}</div>
                  <div className="text-xs text-slate-500">
                    {plan.trigger_type === "date" && plan.next_due_date
                      ? `Proximo: ${formatDate(plan.next_due_date)}`
                      : `Proximo: ${plan.next_due_odometer?.toLocaleString("en-US") ?? "-"} mi`}
                  </div>
                </div>
              ))}
              {activeExpirations.length === 0 && activePlans.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Esta unidad no tiene pendientes activos.
                </div>
              ) : null}
            </div>
          </article>
        </div>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Historial</h2>
          <div className="mt-5 grid gap-4">
            {timeline.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                Aun no hay actividad registrada para esta unidad.
              </div>
            ) : (
              timeline.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/70 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-slate-900">{item.title}</div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getTimelineTone(
                        item.type
                      )}`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-600">{formatDate(item.date)}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.detail || "Sin detalle"}</div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
