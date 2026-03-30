"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DocumentForm } from "@/components/document-form";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type Membership = {
  company_id: string;
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getDocumentState(expiresAt: string | null) {
  if (!expiresAt) {
    return {
      label: "Sin fecha",
      tone: "bg-slate-100 text-slate-700",
      detail: "Sin vencimiento cargado",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${expiresAt}T00:00:00`);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) {
    return {
      label: "Vencido",
      tone: "bg-rose-100 text-rose-800",
      detail: `${Math.abs(diffDays)} dias de atraso`,
    };
  }

  if (diffDays <= 30) {
    return {
      label: "Proximo",
      tone: "bg-amber-100 text-amber-800",
      detail: diffDays === 0 ? "Vence hoy" : `Faltan ${diffDays} dias`,
    };
  }

  return {
    label: "Ready",
    tone: "bg-emerald-100 text-emerald-800",
    detail: `Faltan ${diffDays} dias`,
  };
}

export default function DocumentsPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
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
          { data: documentsData, error: documentsError },
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
        ]);

        if (vehiclesError) {
          throw vehiclesError;
        }

        if (documentsError) {
          throw documentsError;
        }

        if (!isMounted) {
          return;
        }

        setCompanyId(membership.company_id);
        setVehicles(vehiclesData ?? []);
        setDocuments(documentsData ?? []);
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
    const state = getDocumentState(document.expires_at);
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
                  const state = getDocumentState(document.expires_at);

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
                        <div>{document.expires_at ? formatDate(document.expires_at) : "-"}</div>
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
          <DocumentForm companyId={companyId} vehicles={vehicles} />
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
