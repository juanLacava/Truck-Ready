import { NextRequest, NextResponse } from "next/server";
import {
  formatAlertDate,
  getAlertPriority,
  getDocumentAlertState,
  getExpirationAlertState,
  getMaintenanceAlertState,
  renderAlertEmailHtml,
  renderAlertEmailText,
  type AlertSummaryItem,
} from "@/lib/alerts";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type AlertSetting = {
  company_id: string;
  email_enabled: boolean;
  recipient_email: string | null;
  include_overdue: boolean;
  include_upcoming: boolean;
  upcoming_window_days: number;
  companies: {
    name: string;
  } | null;
};

type ExpirationRow = {
  id: string;
  title: string;
  due_date: string;
  alert_days_before: number;
  vehicles: {
    internal_code: string | null;
    plate: string;
  } | null;
};

type MaintenanceRow = {
  id: string;
  title: string;
  trigger_type: "date" | "odometer";
  next_due_date: string | null;
  next_due_odometer: number | null;
  vehicles: {
    internal_code: string | null;
    plate: string;
    current_odometer: number;
  } | null;
};

type DocumentRow = {
  id: string;
  title: string;
  expires_at: string | null;
  vehicles: {
    internal_code: string | null;
    plate: string;
  } | null;
};

function matchesPreference(
  stateLabel: string,
  includeOverdue: boolean,
  includeUpcoming: boolean
) {
  if (stateLabel === "Vencido") {
    return includeOverdue;
  }

  if (stateLabel === "Proximo") {
    return includeUpcoming;
  }

  return false;
}

async function sendWithResend(to: string, subject: string, html: string, text: string) {
  if (!process.env.RESEND_API_KEY || !process.env.ALERTS_FROM_EMAIL) {
    return {
      delivered: false,
      reason: "Missing RESEND_API_KEY or ALERTS_FROM_EMAIL",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.ALERTS_FROM_EMAIL,
      to,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();

    throw new Error(`Resend error: ${detail}`);
  }

  return {
    delivered: true,
  };
}

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.ALERTS_CRON_SECRET;
  const requestSecret = request.headers.get("x-alerts-secret");

  if (!configuredSecret || requestSecret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    companyId?: string;
    dryRun?: boolean;
  };

  const dryRun = body.dryRun ?? false;
  const supabase = getSupabaseAdminClient();

  let settingsQuery = supabase
    .from("company_alert_settings")
    .select(
      "company_id, email_enabled, recipient_email, include_overdue, include_upcoming, upcoming_window_days, companies(name)"
    )
    .eq("email_enabled", true)
    .not("recipient_email", "is", null);

  if (body.companyId) {
    settingsQuery = settingsQuery.eq("company_id", body.companyId);
  }

  const { data: settings, error: settingsError } = await settingsQuery.returns<AlertSetting[]>();

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 });
  }

  const deliveries = [];

  for (const setting of settings ?? []) {
    const [
      { data: expirations, error: expirationsError },
      { data: maintenance, error: maintenanceError },
      { data: documents, error: documentsError },
    ] = await Promise.all([
      supabase
        .from("expiration_items")
        .select("id, title, due_date, alert_days_before, vehicles(internal_code, plate)")
        .eq("company_id", setting.company_id)
        .eq("status", "active")
        .order("due_date", { ascending: true })
        .limit(25)
        .returns<ExpirationRow[]>(),
      supabase
        .from("maintenance_plans")
        .select(
          "id, title, trigger_type, next_due_date, next_due_odometer, vehicles(internal_code, plate, current_odometer)"
        )
        .eq("company_id", setting.company_id)
        .eq("status", "active")
        .limit(25)
        .returns<MaintenanceRow[]>(),
      supabase
        .from("vehicle_documents")
        .select("id, title, expires_at, vehicles(internal_code, plate)")
        .eq("company_id", setting.company_id)
        .eq("status", "active")
        .order("expires_at", { ascending: true, nullsFirst: false })
        .limit(25)
        .returns<DocumentRow[]>(),
    ]);

    if (expirationsError || maintenanceError || documentsError) {
      const detail =
        expirationsError?.message || maintenanceError?.message || documentsError?.message;

      deliveries.push({
        companyId: setting.company_id,
        delivered: false,
        error: detail,
      });
      continue;
    }

    const expirationAlerts: AlertSummaryItem[] = (expirations ?? [])
      .map((item) => {
        const state = getExpirationAlertState(
          item.due_date,
          Math.min(item.alert_days_before, setting.upcoming_window_days)
        );

        return {
          id: item.id,
          categoryLabel: "Vencimiento",
          title: item.title,
          vehicleLabel: item.vehicles?.internal_code || item.vehicles?.plate || "-",
          dueLabel: `Vence el ${formatAlertDate(item.due_date)}`,
          detail: state.detail,
          stateLabel: state.label,
          stateTone: state.tone,
        };
      })
      .filter((item) =>
        matchesPreference(item.stateLabel, setting.include_overdue, setting.include_upcoming)
      );

    const maintenanceAlerts: AlertSummaryItem[] = (maintenance ?? [])
      .map((item) => {
        const state = getMaintenanceAlertState(item);

        return {
          id: item.id,
          categoryLabel: "Mantenimiento",
          title: item.title,
          vehicleLabel: item.vehicles?.internal_code || item.vehicles?.plate || "-",
          dueLabel:
            item.trigger_type === "date" && item.next_due_date
              ? `Proximo: ${formatAlertDate(item.next_due_date)}`
              : `Proximo: ${item.next_due_odometer?.toLocaleString("en-US") ?? "-"} mi`,
          detail: state.detail,
          stateLabel: state.label,
          stateTone: state.tone,
        };
      })
      .filter((item) =>
        matchesPreference(item.stateLabel, setting.include_overdue, setting.include_upcoming)
      );

    const documentAlerts: AlertSummaryItem[] = (documents ?? [])
      .map((item) => {
        const state = getDocumentAlertState(item.expires_at);

        return {
          id: item.id,
          categoryLabel: "Documento",
          title: item.title,
          vehicleLabel: item.vehicles?.internal_code || item.vehicles?.plate || "-",
          dueLabel: item.expires_at
            ? `Vence el ${formatAlertDate(item.expires_at)}`
            : "Sin vencimiento cargado",
          detail: state.detail,
          stateLabel: state.label,
          stateTone: state.tone,
        };
      })
      .filter((item) =>
        matchesPreference(item.stateLabel, setting.include_overdue, setting.include_upcoming)
      );

    const alertItems = [...expirationAlerts, ...maintenanceAlerts, ...documentAlerts]
      .sort((a, b) => getAlertPriority(a.stateLabel) - getAlertPriority(b.stateLabel))
      .slice(0, 12);

    if (alertItems.length === 0) {
      deliveries.push({
        companyId: setting.company_id,
        delivered: false,
        skipped: true,
        reason: "No active alerts",
      });
      continue;
    }

    const companyName = setting.companies?.name ?? "Tu flota";
    const subject = `Truck Ready: ${alertItems.length} alerta${
      alertItems.length === 1 ? "" : "s"
    } activa${alertItems.length === 1 ? "" : "s"} en ${companyName}`;
    const html = renderAlertEmailHtml(companyName, alertItems);
    const text = renderAlertEmailText(companyName, alertItems);

    if (dryRun) {
      deliveries.push({
        companyId: setting.company_id,
        delivered: false,
        preview: true,
        to: setting.recipient_email,
        subject,
        alerts: alertItems.length,
      });
      continue;
    }

    try {
      const delivery = await sendWithResend(setting.recipient_email!, subject, html, text);

      if (delivery.delivered) {
        await supabase
          .from("company_alert_settings")
          .update({ last_sent_at: new Date().toISOString() })
          .eq("company_id", setting.company_id);
      }

      deliveries.push({
        companyId: setting.company_id,
        delivered: delivery.delivered,
        to: setting.recipient_email,
        alerts: alertItems.length,
        ...(delivery.delivered ? {} : { reason: delivery.reason }),
      });
    } catch (error) {
      deliveries.push({
        companyId: setting.company_id,
        delivered: false,
        error: error instanceof Error ? error.message : "Unknown email error",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    companies: deliveries.length,
    deliveries,
  });
}
