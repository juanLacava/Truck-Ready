"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getActiveMembership } from "@/lib/company-membership";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type Membership = {
  company_id: string;
  created_at: string;
  role: "owner" | "admin" | "operator";
  companies: {
    name: string;
  } | null;
};

type AlertSetting = {
  company_id: string;
  email_enabled: boolean;
  recipient_email: string | null;
  sms_enabled: boolean;
  recipient_phone: string | null;
  sms_only_urgent: boolean;
  include_overdue: boolean;
  include_upcoming: boolean;
  upcoming_window_days: number;
  last_sent_at: string | null;
  last_sms_sent_at: string | null;
};

export default function AlertsPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [role, setRole] = useState<Membership["role"] | null>(null);
  const [companyName, setCompanyName] = useState<string>("Tu flota");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsOnlyUrgent, setSmsOnlyUrgent] = useState(true);
  const [includeOverdue, setIncludeOverdue] = useState(true);
  const [includeUpcoming, setIncludeUpcoming] = useState(true);
  const [upcomingWindowDays, setUpcomingWindowDays] = useState("15");
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [lastSmsSentAt, setLastSmsSentAt] = useState<string | null>(null);
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

        const membership = await getActiveMembership<Membership>(
          supabase,
          session.user.id,
          "company_id, created_at, role, companies(name)"
        );

        if (!membership) {
          router.replace("/onboarding");
          return;
        }

        const { data: setting, error: settingError } = await supabase
          .from("company_alert_settings")
          .select(
            "company_id, email_enabled, recipient_email, sms_enabled, recipient_phone, sms_only_urgent, include_overdue, include_upcoming, upcoming_window_days, last_sent_at, last_sms_sent_at"
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
        setRole(membership.role);
        setCompanyName(membership.companies?.name ?? "Tu flota");
        setRecipientEmail(setting?.recipient_email ?? session.user.email ?? "");
        setEmailEnabled(setting?.email_enabled ?? false);
        setRecipientPhone(setting?.recipient_phone ?? "");
        setSmsEnabled(setting?.sms_enabled ?? false);
        setSmsOnlyUrgent(setting?.sms_only_urgent ?? true);
        setIncludeOverdue(setting?.include_overdue ?? true);
        setIncludeUpcoming(setting?.include_upcoming ?? true);
        setUpcomingWindowDays(String(setting?.upcoming_window_days ?? 15));
        setLastSentAt(setting?.last_sent_at ?? null);
        setLastSmsSentAt(setting?.last_sms_sent_at ?? null);
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

    if (role === "operator") {
      setError("Solo owners y admins pueden cambiar la configuracion de alertas.");
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
        sms_enabled: smsEnabled,
        recipient_phone: recipientPhone.trim() || null,
        sms_only_urgent: smsOnlyUrgent,
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
      description="Define que canales usa Truck Ready para avisar y que tipo de alertas debe priorizar."
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
                <h2 className="text-xl font-semibold text-slate-900">Canales de alerta</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Configura email y SMS para sacar alertas fuera del dashboard de {companyName}.
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

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4">
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(event) => setSmsEnabled(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-medium text-slate-900">Activar SMS</div>
                  <div className="mt-1 text-sm text-slate-600">
                    Envia alertas por SMS. Recomendado para vencidos y urgencias operativas.
                  </div>
                </div>
              </label>

              <div>
                <label htmlFor="recipientPhone" className="text-sm font-medium text-slate-700">
                  Telefono para SMS
                </label>
                <input
                  id="recipientPhone"
                  type="tel"
                  value={recipientPhone}
                  onChange={(event) => setRecipientPhone(event.target.value)}
                  placeholder="+13055550149"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Usa formato internacional E.164, por ejemplo +13055550149.
                </p>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4">
                <input
                  type="checkbox"
                  checked={smsOnlyUrgent}
                  onChange={(event) => setSmsOnlyUrgent(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-medium text-slate-900">SMS solo para vencidos</div>
                  <div className="mt-1 text-sm text-slate-600">
                    Evita ruido y reserva SMS para alertas realmente urgentes.
                  </div>
                </div>
              </label>

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
                  Ventana maxima en dias para alertas proximas
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
                <p className="mt-2 text-xs text-slate-500">
                  Aplica a vencimientos, documentos y mantenimientos por fecha.
                </p>
              </div>

              {role === "operator" ? (
                <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Tu rol actual es operador. Puedes ver la configuracion, pero no editarla.
                </div>
              ) : null}

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
                disabled={isSaving || role === "operator"}
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

            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
              {lastSmsSentAt
                ? `Ultimo SMS registrado: ${new Date(lastSmsSentAt).toLocaleString("es-AR")}`
                : "Todavia no hay SMS registrados para esta empresa."}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Siguiente paso tecnico</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Configura `SUPABASE_SERVICE_ROLE_KEY`, `ALERTS_CRON_SECRET`, `RESEND_API_KEY` y `ALERTS_FROM_EMAIL` para habilitar email real.</p>
              <p>Si vas a usar SMS, agrega `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` y `TWILIO_FROM_NUMBER`.</p>
              <p>Despues puedes disparar el endpoint `POST /api/alerts/email` desde un cron diario o desde Vercel Cron.</p>
            </div>
          </section>
        </aside>
      </div>
    </DashboardLayout>
  );
}
