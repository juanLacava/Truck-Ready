"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DocumentForm } from "@/components/document-form";
import { getActiveMembership } from "@/lib/company-membership";
import { formatAlertDate, getDocumentAlertState } from "@/lib/alerts";
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
};

type VehicleDocument = {
  id: string;
  title: string;
  document_type: string;
  language: "es" | "en" | "bilingual";
  expires_at: string | null;
  file_url: string | null;
  notes: string | null;
  status: "active" | "archived";
  vehicles: Vehicle | null;
};

export default function DocumentsPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [role, setRole] = useState<Membership["role"] | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [upcomingWindowDays, setUpcomingWindowDays] = useState(15);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
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
          { data: documentsData, error: documentsError },
          { data: settingsData, error: settingsError },
        ] = await Promise.all([
          supabase
            .from("vehicles")
            .select("id, internal_code, plate")
            .eq("company_id", membership.company_id)
            .order("created_at", { ascending: false })
            .returns<Vehicle[]>(),
          supabase
            .from("vehicle_documents")
            .select(
              "id, title, document_type, language, expires_at, file_url, notes, status, vehicles(id, internal_code, plate)"
            )
            .eq("company_id", membership.company_id)
            .neq("status", "archived")
            .order("expires_at", { ascending: true, nullsFirst: false })
            .returns<VehicleDocument[]>(),
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

        if (documentsError) {
          throw documentsError;
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
        setDocuments(documentsData ?? []);
        setUpcomingWindowDays(settingsData?.upcoming_window_days ?? 15);
      } catch (loadError) {
        const detail =
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar los documentos.";

        if (isMounted) {
          setError(detail);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDocuments();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const documentsNeedingAttention = documents.filter((document) => {
    const state = getDocumentAlertState(document.expires_at, upcomingWindowDays);
    return state.label === "Vencido" || state.label === "Proximo";
  }).length;

  return (
    <DashboardLayout
      title="Documentos"
      description="Boveda operativa por unidad para polizas, licencias, inspecciones y respaldos clave."
    >
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Documentos activos</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {documents.length}
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Unidades con documentos</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {new Set(documents.map((document) => document.vehicles?.id).filter(Boolean)).size}
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Proximos o vencidos</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {documentsNeedingAttention}
          </div>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Unidad</th>
                <th className="px-4 py-3 font-medium">Documento</th>
                <th className="px-4 py-3 font-medium">Vence</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Cargando documentos...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-rose-700">
                    {error}
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Aun no hay documentos cargados.
                  </td>
                </tr>
              ) : (
                documents.map((document) => {
                  const state = getDocumentAlertState(document.expires_at, upcomingWindowDays);

                  return (
                    <tr key={document.id}>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-medium text-slate-900">
                          {document.vehicles?.internal_code || document.vehicles?.plate || "-"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {document.vehicles?.plate || "Sin detalle"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-medium text-slate-900">{document.title}</div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          {document.document_type} · {document.language}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{document.expires_at ? formatAlertDate(document.expires_at) : "-"}</div>
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

        {role === "operator" ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="text-sm font-semibold text-amber-900">
              Tu rol actual es operador. Puedes ver documentos, pero no cargar nuevos.
            </div>
          </div>
        ) : null}

        {companyId ? (
          <DocumentForm companyId={companyId} vehicles={vehicles} canEdit={role !== "operator"} />
        ) : (
          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-500">
              La empresa aun no esta lista para cargar documentos.
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
