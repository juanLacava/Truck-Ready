"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveMembership } from "@/lib/company-membership";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type Membership = {
  company_id: string;
  created_at: string;
  companies: {
    name: string;
  } | null;
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

type VehicleDocument = {
  id: string;
  title: string;
  document_type: string;
  expires_at: string | null;
  language: "es" | "en" | "bilingual";
  status: "active" | "archived";
};

type ServiceRecord = {
  id: string;
  service_date: string;
  service_type: string;
  odometer: number | null;
  cost: number | null;
  notes: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
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

function getExpirationLabel(status: ExpirationItem["status"]) {
  if (status === "completed") return "Completed";
  if (status === "archived") return "Archived";
  return "Active";
}

function getDocumentLabel(status: VehicleDocument["status"]) {
  return status === "archived" ? "Archived" : "Active";
}

function getMaintenanceLabel(plan: MaintenancePlan) {
  if (plan.status === "paused") return "Paused";
  if (plan.status === "archived") return "Archived";

  if (plan.trigger_type === "date" && plan.next_due_date) {
    return `Next due ${formatDate(plan.next_due_date)}`;
  }

  if (plan.trigger_type === "odometer" && plan.next_due_odometer !== null) {
    return `Next due ${plan.next_due_odometer.toLocaleString("en-US")} mi`;
  }

  return "Active";
}

export default function VehicleReportPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("Truck Ready");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [expirations, setExpirations] = useState<ExpirationItem[]>([]);
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
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

        const membership = await getActiveMembership<Membership>(
          supabase,
          session.user.id,
          "company_id, created_at, companies(name)"
        );

        if (!membership) {
          router.replace("/onboarding");
          return;
        }

        const [
          { data: vehicleData, error: vehicleError },
          { data: expirationsData, error: expirationsError },
          { data: plansData, error: plansError },
          { data: documentsData, error: documentsError },
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
            .from("vehicle_documents")
            .select("id, title, document_type, expires_at, language, status")
            .eq("company_id", membership.company_id)
            .eq("vehicle_id", currentVehicleId)
            .neq("status", "archived")
            .order("expires_at", { ascending: false, nullsFirst: false })
            .returns<VehicleDocument[]>(),
          supabase
            .from("service_records")
            .select("id, service_date, service_type, odometer, cost, notes")
            .eq("company_id", membership.company_id)
            .eq("vehicle_id", currentVehicleId)
            .order("service_date", { ascending: false })
            .order("created_at", { ascending: false })
            .returns<ServiceRecord[]>(),
        ]);

        if (vehicleError) throw vehicleError;
        if (expirationsError) throw expirationsError;
        if (plansError) throw plansError;
        if (documentsError) throw documentsError;
        if (servicesError) throw servicesError;

        if (!vehicleData) {
          router.replace("/vehicles");
          return;
        }

        if (!isMounted) {
          return;
        }

        setCompanyName(membership.companies?.name ?? "Truck Ready");
        setVehicle(vehicleData);
        setExpirations(expirationsData ?? []);
        setPlans(plansData ?? []);
        setDocuments(documentsData ?? []);
        setServices(servicesData ?? []);
      } catch (loadError) {
        const detail =
          loadError instanceof Error
            ? loadError.message
            : "Could not generate the vehicle report.";

        if (isMounted) {
          setError(detail);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      isMounted = false;
    };
  }, [params, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
          Building report...
        </div>
      </main>
    );
  }

  if (error || !vehicle) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-800">
          {error ?? "Could not load report."}
        </div>
      </main>
    );
  }

  const totalServiceCost = services.reduce((sum, item) => sum + (item.cost ?? 0), 0);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 md:px-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:p-10 print:shadow-none">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex gap-3">
            <Link
              href={`/vehicles/${vehicle.id}`}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700"
            >
              Volver a la unidad
            </Link>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white"
          >
            Exportar a PDF
          </button>
        </div>

        <header className="border-b border-slate-200 pb-6">
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Truck Ready Fleet Report
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                {vehicle.internal_code || vehicle.plate}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Maintenance, documents, expirations and service history summary prepared for
                operations, insurance review or inspection support.
              </p>
            </div>
            <div className="grid gap-1 text-sm text-slate-600">
              <div>{companyName}</div>
              <div>Generated {new Date().toLocaleString("en-US")}</div>
              <div>Status: {vehicle.status}</div>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <article className="rounded-3xl bg-slate-50 p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Vehicle</div>
            <div className="mt-2 text-lg font-semibold text-slate-950">
              {[vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(" ") || "-"}
            </div>
          </article>
          <article className="rounded-3xl bg-slate-50 p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Plate</div>
            <div className="mt-2 text-lg font-semibold text-slate-950">{vehicle.plate}</div>
          </article>
          <article className="rounded-3xl bg-slate-50 p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Odometer</div>
            <div className="mt-2 text-lg font-semibold text-slate-950">
              {vehicle.current_odometer.toLocaleString("en-US")} mi
            </div>
          </article>
          <article className="rounded-3xl bg-slate-50 p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Service records</div>
            <div className="mt-2 text-lg font-semibold text-slate-950">{services.length}</div>
          </article>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <article className="rounded-3xl border border-slate-200 p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Expirations</div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">{expirations.length}</div>
          </article>
          <article className="rounded-3xl border border-slate-200 p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Maintenance plans</div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">{plans.length}</div>
          </article>
          <article className="rounded-3xl border border-slate-200 p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Documents</div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">{documents.length}</div>
          </article>
          <article className="rounded-3xl border border-slate-200 p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Tracked service spend</div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">
              {formatCurrency(totalServiceCost)}
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-2">
          <article>
            <h2 className="text-lg font-semibold text-slate-950">Recent service history</h2>
            <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Service</th>
                    <th className="px-4 py-3 font-medium">Odometer</th>
                    <th className="px-4 py-3 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                        No service history recorded yet.
                      </td>
                    </tr>
                  ) : (
                    services.map((service) => (
                      <tr key={service.id}>
                        <td className="px-4 py-3">{formatDate(service.service_date)}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{service.service_type}</div>
                          <div className="text-xs text-slate-500">{service.notes || "No notes"}</div>
                        </td>
                        <td className="px-4 py-3">
                          {service.odometer !== null
                            ? `${service.odometer.toLocaleString("en-US")} mi`
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {service.cost !== null ? formatCurrency(service.cost) : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article>
            <h2 className="text-lg font-semibold text-slate-950">Active maintenance plans</h2>
            <div className="mt-4 grid gap-3">
              {plans.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 px-5 py-5 text-sm text-slate-500">
                  No maintenance plans registered.
                </div>
              ) : (
                plans.map((plan) => (
                  <div key={plan.id} className="rounded-3xl border border-slate-200 px-5 py-4">
                    <div className="font-medium text-slate-950">{plan.title}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {plan.trigger_type === "date" ? "Date-based" : "Mileage-based"}
                    </div>
                    <div className="mt-2 text-sm text-slate-700">{getMaintenanceLabel(plan)}</div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-2">
          <article>
            <h2 className="text-lg font-semibold text-slate-950">Tracked expirations</h2>
            <div className="mt-4 grid gap-3">
              {expirations.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 px-5 py-5 text-sm text-slate-500">
                  No tracked expirations.
                </div>
              ) : (
                expirations.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 px-5 py-4">
                    <div className="font-medium text-slate-950">{item.title}</div>
                    <div className="mt-2 text-sm text-slate-700">
                      Due {formatDate(item.due_date)} · {getExpirationLabel(item.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article>
            <h2 className="text-lg font-semibold text-slate-950">Document vault overview</h2>
            <div className="mt-4 grid gap-3">
              {documents.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 px-5 py-5 text-sm text-slate-500">
                  No documents uploaded.
                </div>
              ) : (
                documents.map((document) => (
                  <div key={document.id} className="rounded-3xl border border-slate-200 px-5 py-4">
                    <div className="font-medium text-slate-950">{document.title}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {document.document_type} · {document.language}
                    </div>
                    <div className="mt-2 text-sm text-slate-700">
                      {document.expires_at ? `Expires ${formatDate(document.expires_at)}` : "No expiration date"} ·{" "}
                      {getDocumentLabel(document.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Operational notes</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {vehicle.notes ||
              "No additional notes were recorded for this unit at the time this report was generated."}
          </p>
        </section>
      </div>
    </main>
  );
}
