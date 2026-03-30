export type MaintenanceAlertInput = {
  trigger_type: "date" | "odometer";
  next_due_date: string | null;
  next_due_odometer: number | null;
  vehicles: {
    current_odometer: number;
  } | null;
};

export type AlertSummaryItem = {
  id: string;
  categoryLabel: string;
  title: string;
  vehicleLabel: string;
  dueLabel: string;
  detail: string;
  stateLabel: string;
  stateTone: string;
};

export function formatAlertDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function getExpirationAlertState(dueDate: string, alertDaysBefore: number) {
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

export function getMaintenanceAlertState(plan: MaintenanceAlertInput) {
  if (plan.trigger_type === "date" && plan.next_due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(`${plan.next_due_date}T00:00:00`);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);

    if (diffDays < 0) {
      return {
        label: "Vencido",
        tone: "bg-rose-100 text-rose-800",
        detail: `${Math.abs(diffDays)} dias de atraso`,
      };
    }

    if (diffDays <= 7) {
      return {
        label: "Proximo",
        tone: "bg-amber-100 text-amber-800",
        detail: diffDays === 0 ? "Toca hoy" : `Faltan ${diffDays} dias`,
      };
    }

    return {
      label: "Al dia",
      tone: "bg-emerald-100 text-emerald-800",
      detail: `Faltan ${diffDays} dias`,
    };
  }

  if (plan.trigger_type === "odometer" && plan.next_due_odometer !== null) {
    const remaining = plan.next_due_odometer - (plan.vehicles?.current_odometer ?? 0);

    if (remaining < 0) {
      return {
        label: "Vencido",
        tone: "bg-rose-100 text-rose-800",
        detail: `${Math.abs(remaining).toLocaleString("en-US")} mi de atraso`,
      };
    }

    if (remaining <= 1000) {
      return {
        label: "Proximo",
        tone: "bg-amber-100 text-amber-800",
        detail:
          remaining === 0
            ? "Toca ahora"
            : `Faltan ${remaining.toLocaleString("en-US")} mi`,
      };
    }

    return {
      label: "Al dia",
      tone: "bg-emerald-100 text-emerald-800",
      detail: `Faltan ${remaining.toLocaleString("en-US")} mi`,
    };
  }

  return {
    label: "Sin base",
    tone: "bg-slate-100 text-slate-700",
    detail: "Faltan datos para calcular",
  };
}

export function getDocumentAlertState(expiresAt: string | null) {
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

export function getAlertPriority(label: string) {
  if (label === "Vencido") return 0;
  if (label === "Proximo") return 1;
  return 2;
}

export function renderAlertEmailText(companyName: string, items: AlertSummaryItem[]) {
  const header = `Truck Ready - Resumen diario de alertas para ${companyName}`;

  const lines = items.map((item) => {
    return [
      `${item.categoryLabel}: ${item.title}`,
      `Unidad: ${item.vehicleLabel}`,
      `Estado: ${item.stateLabel}`,
      `Base: ${item.dueLabel}`,
      `Detalle: ${item.detail}`,
    ].join("\n");
  });

  return [header, "", ...lines].join("\n\n");
}

export function renderAlertEmailHtml(companyName: string, items: AlertSummaryItem[]) {
  const cards = items
    .map((item) => {
      const badgeColor =
        item.stateLabel === "Vencido"
          ? "#ffe4e6"
          : item.stateLabel === "Proximo"
            ? "#fef3c7"
            : "#dcfce7";

      const badgeText =
        item.stateLabel === "Vencido"
          ? "#9f1239"
          : item.stateLabel === "Proximo"
            ? "#92400e"
            : "#166534";

      return `
        <div style="border:1px solid #e2e8f0;border-radius:18px;padding:16px;margin-bottom:12px;background:#ffffff;">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
            <div>
              <div style="font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#64748b;">${item.categoryLabel}</div>
              <div style="margin-top:4px;font-size:18px;font-weight:600;color:#0f172a;">${item.title}</div>
              <div style="margin-top:4px;font-size:14px;color:#475569;">${item.vehicleLabel}</div>
            </div>
            <div style="border-radius:999px;padding:6px 10px;background:${badgeColor};color:${badgeText};font-size:12px;font-weight:600;">
              ${item.stateLabel}
            </div>
          </div>
          <div style="margin-top:12px;font-size:14px;color:#0f172a;">${item.dueLabel}</div>
          <div style="margin-top:4px;font-size:13px;color:#64748b;">${item.detail}</div>
        </div>
      `;
    })
    .join("");

  return `
    <div style="background:#f8fafc;padding:24px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a;">
      <div style="max-width:720px;margin:0 auto;">
        <div style="margin-bottom:16px;">
          <div style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#64748b;">Truck Ready</div>
          <h1 style="margin:8px 0 0;font-size:28px;line-height:1.2;">Resumen diario de alertas</h1>
          <p style="margin:8px 0 0;font-size:15px;color:#475569;">
            ${companyName} tiene ${items.length} alerta${items.length === 1 ? "" : "s"} activa${items.length === 1 ? "" : "s"} entre vencimientos, mantenimiento y documentos.
          </p>
        </div>
        ${cards}
      </div>
    </div>
  `;
}
