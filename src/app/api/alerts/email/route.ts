import { NextRequest, NextResponse } from "next/server";
import {
  formatAlertDate,
  getAlertPriority,
  getDocumentAlertState,
  getExpirationAlertState,
  getMaintenanceAlertState,
  renderAlertEmailHtml,
  renderAlertEmailText,
  renderAlertSmsText,
  type AlertSummaryItem,
} from "@/lib/alerts";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

type RankedAlertItem = AlertSummaryItem & {
  sortValue: number;
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

function getDaysUntil(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(`${value}T00:00:00`);

  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function getMaintenanceSortValue(item: MaintenanceRow) {
  if (item.trigger_type === "date" && item.next_due_date) {
    return getDaysUntil(item.next_due_date);
  }

  if (item.trigger_type === "odometer" && item.next_due_odometer !== null) {
    return item.next_due_odometer - (item.vehicles?.current_odometer ?? 0);
  }

  return Number.POSITIVE_INFINITY;
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

function isE164Phone(value: string) {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

async function sendWithTwilio(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from) {
    return {
      delivered: false,
      reason: "Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN or TWILIO_FROM_NUMBER",
    };
  }

  if (!isE164Phone(to)) {
    return {
      delivered: false,
      reason: "recipient_phone must use E.164 format",
    };
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: from,
        Body: body,
      }),
    }
  );

  if (!response.ok) {
    const detail = await response.text();

    throw new Error(`Twilio error: ${detail}`);
  }

  return {
    delivered: true,
  };
}

function isAuthorized(request: NextRequest) {
  const configuredSecret = process.env.ALERTS_CRON_SECRET;
  const bearerToken = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  const requestSecret = request.headers.get("x-alerts-secret");

  if (!configuredSecret) {
    return false;
  }

  return bearerToken === configuredSecret || requestSecret === configuredSecret;
}

async function processEmailAlerts({
  companyId,
  dryRun,
}: {
  companyId?: string;
  dryRun: boolean;
}) {
  let supabase;

  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Missing alert environment configuration",
      },
      { status: 500 }
    );
  }

  let settingsQuery = supabase
    .from("company_alert_settings")
    .select(
      "company_id, email_enabled, recipient_email, sms_enabled, recipient_phone, sms_only_urgent, include_overdue, include_upcoming, upcoming_window_days, companies(name)"
    )
    .or("email_enabled.eq.true,sms_enabled.eq.true");

  if (companyId) {
    settingsQuery = settingsQuery.eq("company_id", companyId);
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
        .limit(100)
        .returns<ExpirationRow[]>(),
      supabase
        .from("maintenance_plans")
        .select(
          "id, title, trigger_type, next_due_date, next_due_odometer, vehicles(internal_code, plate, current_odometer)"
        )
        .eq("company_id", setting.company_id)
        .eq("status", "active")
        .limit(100)
        .returns<MaintenanceRow[]>(),
      supabase
        .from("vehicle_documents")
        .select("id, title, expires_at, vehicles(internal_code, plate)")
        .eq("company_id", setting.company_id)
        .eq("status", "active")
        .order("expires_at", { ascending: true, nullsFirst: false })
        .limit(100)
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

    const expirationAlerts: RankedAlertItem[] = (expirations ?? [])
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
          sortValue: getDaysUntil(item.due_date),
        };
      })
      .filter((item) =>
        matchesPreference(item.stateLabel, setting.include_overdue, setting.include_upcoming)
      );

    const maintenanceAlerts: RankedAlertItem[] = (maintenance ?? [])
      .map((item) => {
        const state = getMaintenanceAlertState(item, {
          dateWindowDays: setting.upcoming_window_days,
        });

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
          sortValue: getMaintenanceSortValue(item),
        };
      })
      .filter((item) =>
        matchesPreference(item.stateLabel, setting.include_overdue, setting.include_upcoming)
      );

    const documentAlerts: RankedAlertItem[] = (documents ?? [])
      .map((item) => {
        const state = getDocumentAlertState(item.expires_at, setting.upcoming_window_days);

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
          sortValue: item.expires_at ? getDaysUntil(item.expires_at) : Number.POSITIVE_INFINITY,
        };
      })
      .filter((item) =>
        matchesPreference(item.stateLabel, setting.include_overdue, setting.include_upcoming)
      );

    const alertItems = [...expirationAlerts, ...maintenanceAlerts, ...documentAlerts]
      .sort((a, b) => {
        const priorityDiff = getAlertPriority(a.stateLabel) - getAlertPriority(b.stateLabel);

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        return a.sortValue - b.sortValue;
      })
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
    const smsItems = setting.sms_only_urgent
      ? alertItems.filter((item) => item.stateLabel === "Vencido")
      : alertItems;
    const smsText = smsItems.length > 0 ? renderAlertSmsText(companyName, smsItems) : null;
    const emailReady = setting.email_enabled && Boolean(setting.recipient_email);
    const smsReady = setting.sms_enabled && Boolean(setting.recipient_phone);

    if (!emailReady && !smsReady) {
      deliveries.push({
        companyId: setting.company_id,
        delivered: false,
        skipped: true,
        reason: "No delivery channel configured",
      });
      continue;
    }

    if (dryRun) {
      deliveries.push({
        companyId: setting.company_id,
        delivered: false,
        preview: true,
        alerts: alertItems.length,
        email: emailReady
          ? {
              to: setting.recipient_email,
              subject,
            }
          : null,
        sms: smsReady
          ? {
              to: setting.recipient_phone,
              alerts: smsItems.length,
              urgentOnly: setting.sms_only_urgent,
            }
          : null,
      });
      continue;
    }

    const deliveryResult: {
      companyId: string;
      delivered: boolean;
      alerts: number;
      email?: Record<string, unknown>;
      sms?: Record<string, unknown>;
    } = {
      companyId: setting.company_id,
      delivered: false,
      alerts: alertItems.length,
    };

    if (emailReady) {
      try {
        const emailDelivery = await sendWithResend(setting.recipient_email!, subject, html, text);

        if (emailDelivery.delivered) {
          await supabase
            .from("company_alert_settings")
            .update({ last_sent_at: new Date().toISOString() })
            .eq("company_id", setting.company_id);
        }

        deliveryResult.email = {
          delivered: emailDelivery.delivered,
          to: setting.recipient_email,
          ...(emailDelivery.delivered ? {} : { reason: emailDelivery.reason }),
        };
      } catch (error) {
        deliveryResult.email = {
          delivered: false,
          to: setting.recipient_email,
          error: error instanceof Error ? error.message : "Unknown email error",
        };
      }
    }

    if (smsReady) {
      if (!smsText || smsItems.length === 0) {
        deliveryResult.sms = {
          delivered: false,
          to: setting.recipient_phone,
          skipped: true,
          reason: "No SMS-eligible alerts",
        };
      } else {
        try {
          const smsDelivery = await sendWithTwilio(setting.recipient_phone!, smsText);

          if (smsDelivery.delivered) {
            await supabase
              .from("company_alert_settings")
              .update({ last_sms_sent_at: new Date().toISOString() })
              .eq("company_id", setting.company_id);
          }

          deliveryResult.sms = {
            delivered: smsDelivery.delivered,
            to: setting.recipient_phone,
            alerts: smsItems.length,
            urgentOnly: setting.sms_only_urgent,
            ...(smsDelivery.delivered ? {} : { reason: smsDelivery.reason }),
          };
        } catch (error) {
          deliveryResult.sms = {
            delivered: false,
            to: setting.recipient_phone,
            error: error instanceof Error ? error.message : "Unknown SMS error",
          };
        }
      }
    }

    deliveryResult.delivered =
      deliveryResult.email?.delivered === true || deliveryResult.sms?.delivered === true;

    deliveries.push(deliveryResult);
  }

  return NextResponse.json({
    ok: true,
    companies: deliveries.length,
    deliveries,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    companyId?: string;
    dryRun?: boolean;
  };

  return processEmailAlerts({
    companyId: body.companyId,
    dryRun: body.dryRun ?? false,
  });
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = request.nextUrl.searchParams.get("companyId") ?? undefined;
  const dryRun = request.nextUrl.searchParams.get("dryRun") === "true";

  return processEmailAlerts({
    companyId,
    dryRun,
  });
}
