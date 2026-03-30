"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type Membership = {
  company_id: string;
  role: "owner" | "admin" | "operator";
  companies: {
    name: string;
  } | null;
};

type AlertSetting = {
  company_id: string;
  email_enabled: boolean;
  recipient_email: string | null;
  include_overdue: boolean;
  include_upcoming: boolean;
  upcoming_window_days: number;
  last_sent_at: string | null;
};

export default function AlertsPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("Tu flota");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [includeOverdue, setIncludeOverdue] = useState(true);
  const [includeUpcoming, setIncludeUpcoming] = useState(true);
  const [upcomingWindowDays, setUpcomingWindowDays] = useState("15");
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
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
          .select("company_id, role, companies(name)")
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

        const { data: setting, error: settingError } = await supabase
          .from("company_alert_settings")
          .select(
            "company_id, email_enabled, recipient_email, include_overdue, include_upcoming, upcoming_window_days, last_sent_at"
          )
          .eq("company_id", membership.company_id)
          .returns<AlertSetting[]>()
          .maybeSingle();

        if (settingError) {
          throw settingError;
        }

        if (!isMounted) {
          return;
        }

        setCompanyId(membership.company_id);
        setCompanyName(membership.companies?.name ?? "Tu flota");
        setRecipientEmail(setting?.recipient_email ?? session.user.email ?? "");
        setEmailEnabled(setting?.email_enabled ?? false);
        setIncludeOverdue(setting?.include_overdue ?? true);
        setIncludeUpcoming(setting?.include_upcoming ?? true);
        setUpcomingWindowDays(String(setting?.upcoming_window_days ?? 15));
        setLastSentAt(setting?.last_sent_at ?? null);
      } catch (loadError) {
        const detail =
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar las alertas.";

        if (isMounted) {
          setError(detail);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!companyId) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: saveError } = await supabase.from("company_alert_settings").upsert({
        company_id: companyId,
        email_enabled: emailEnabled,
        recipient_email: recipientEmail.trim() || null,
        include_overdue: includeOverdue,
        include_upcoming: includeUpcoming,
        upcoming_window_days: Number(upcomingWindowDays) || 15,
      });

      if (saveError) {
        throw saveError;
      }

      setMessage("Preferencias guardadas. El resumen diario ya puede usar esta configuracion.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudieron guardar las preferencias."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DashboardLayout
      title="Alertas"
      description="Define a que email llega el resumen diario y que tipo de alertas debe priorizar Truck Ready."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
          {isLoading ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
              Cargando configuracion...
            </div>
          ) : (
            <form className="grid gap-5" onSubmit={handleSubmit}>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Resumen diario por email</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Configura el resumen que usara {companyName} para sacar las alertas fuera del dashboard.
                </p>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(event) => setEmailEnabled(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-medium text-slate-900">Activar email diario</div>
                  <div className="mt-1 text-sm text-slate-600">
                    Envía un resumen diario con alertas vencidas y próximas.
                  </div>
                </div>
              </label>

              <div>
                <label htmlFor="recipientEmail" className="text-sm font-medium text-slate-700">
                  Email de destino
                </label>
                <input
                  id="recipientEmail"
                  type="email"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  placeholder="operaciones@tuempresa.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={includeOverdue}
                    onChange={(event) => setIncludeOverdue(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-medium text-slate-900">Incluir vencidos</div>
                    <div className="mt-1 text-sm text-slate-600">
                      Prioriza riesgos inmediatos y atrasos operativos.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={includeUpcoming}
                    onChange={(event) => setIncludeUpcoming(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-medium text-slate-900">Incluir proximos</div>
                    <div className="mt-1 text-sm text-slate-600">
                      Adelanta acciones antes de que se conviertan en problema.
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label
                  htmlFor="upcomingWindowDays"
                  className="text-sm font-medium text-slate-700"
                >
                  Ventana maxima para alertas proximas
                </label>
                <input
                  id="upcomingWindowDays"
                  type="number"
                  min="1"
                  max="30"
                  value={upcomingWindowDays}
                  onChange={(event) => setUpcomingWindowDays(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>

              {error ? (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-fit items-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Guardando..." : "Guardar preferencias"}
              </button>
            </form>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Estado del envio</h2>
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
              {lastSentAt
                ? `Ultimo envio registrado: ${new Date(lastSentAt).toLocaleString("es-AR")}`
                : "Todavia no hay envios registrados para esta empresa."}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Siguiente paso tecnico</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Configura `SUPABASE_SERVICE_ROLE_KEY`, `ALERTS_CRON_SECRET`, `RESEND_API_KEY` y `ALERTS_FROM_EMAIL` para habilitar envios reales.</p>
              <p>Despues puedes disparar el endpoint `POST /api/alerts/email` desde un cron diario o desde Vercel Cron.</p>
            </div>
          </section>
        </aside>
      </div>
    </DashboardLayout>
  );
}
