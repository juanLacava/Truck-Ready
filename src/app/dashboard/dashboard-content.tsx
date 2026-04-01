import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getFleetHealthScore({
  vehicleCount,
  alertCount,
  expirationCount,
  maintenanceCount,
}: {
  vehicleCount: number;
  alertCount: number;
  expirationCount: number;
  maintenanceCount: number;
}) {
  const trackedItems = Math.max(vehicleCount + expirationCount + maintenanceCount, 1);
  const pressure = clamp((alertCount / trackedItems) * 100, 0, 100);
  return Math.round(clamp(100 - pressure * 1.35, 18, 100));
}

function getDialTone(score: number) {
  if (score >= 80) {
    return {
      stroke: "#059669",
      glow: "shadow-[0_0_40px_rgba(5,150,105,0.28)]",
      label: "Fleet Green",
    };
  }

  if (score >= 55) {
    return {
      stroke: "#FACC15",
      glow: "shadow-[0_0_40px_rgba(250,204,21,0.28)]",
      label: "Watchlist",
    };
  }

  return {
    stroke: "#B91C1C",
    glow: "shadow-[0_0_40px_rgba(185,28,28,0.24)]",
    label: "Critical",
  };
}

function SafetyDial({ score }: { score: number }) {
  const size = 220;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const tone = getDialTone(score);

  return (
    <div className="relative">
      <div className={`absolute inset-7 rounded-full bg-white/20 blur-2xl ${tone.glow}`} aria-hidden="true" />
      <svg viewBox={`0 0 ${size} ${size}`} className="relative h-[220px] w-[220px] -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E293B"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tone.stroke}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-400">
          Fleet Health
        </div>
        <div className="mt-1 font-mono text-5xl font-black text-white">{score}</div>
        <div className="mt-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
          {tone.label}
        </div>
      </div>
    </div>
  );
}

export function DashboardContent({
  companyName,
  vehicleCount,
  expirationCount,
  maintenanceCount,
  serviceCount,
  alertCount,
  upcomingExpirations,
  upcomingMaintenance,
  systemAlerts,
}: {
  companyName: string;
  vehicleCount: number;
  expirationCount: number;
  maintenanceCount: number;
  serviceCount: number;
  alertCount: number;
  upcomingExpirations: Array<{
    id: string;
    title: string;
    dueDate: string;
    vehicleLabel: string;
    detail: string;
    stateLabel: string;
    stateTone: string;
  }>;
  upcomingMaintenance: Array<{
    id: string;
    title: string;
    dueLabel: string;
    vehicleLabel: string;
    detail: string;
    stateLabel: string;
    stateTone: string;
  }>;
  systemAlerts: Array<{
    id: string;
    title: string;
    dueLabel: string;
    vehicleLabel: string;
    categoryLabel: string;
    detail: string;
    stateLabel: string;
    stateTone: string;
  }>;
}) {
  const fleetHealthScore = getFleetHealthScore({
    vehicleCount,
    alertCount,
    expirationCount,
    maintenanceCount,
  });

  const cards = [
    { label: "Unidades activas", value: String(vehicleCount) },
    { label: "Vencimientos activos", value: String(expirationCount) },
    { label: "Planes activos", value: String(maintenanceCount) },
    { label: "Servicios registrados", value: String(serviceCount) },
    { label: "Alertas activas", value: String(alertCount) },
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      description={`Centro de control de ${companyName}. Monitoreo de cumplimiento y estado operativo.`}
    >
      <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <article className="overflow-hidden rounded-[32px] border-2 border-slate-900 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.28)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-300">
                Mission Control
              </div>
              <h2 className="mt-3 text-2xl font-black uppercase tracking-tight">Mission status</h2>
            </div>
            <Link
              href="/compliance"
              className="rounded-2xl border-2 border-amber-300 bg-amber-300 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-white"
            >
              Inspection mode
            </Link>
          </div>

          <div className="mt-8 flex justify-center">
            <SafetyDial score={fleetHealthScore} />
          </div>

          <div className="mt-8 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                Active alerts
              </div>
              <div className="mt-2 font-mono text-3xl font-black text-white">{alertCount}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-bold leading-relaxed text-slate-300">
              Usa este marcador como lectura rapida de riesgo operativo. A menor score, mas urgente es entrar a compliance y resolver alertas.
            </div>
          </div>
        </article>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-slate-300 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="text-sm font-bold text-slate-700">{card.label}</div>
              <div className="mt-2 font-mono text-4xl font-black tracking-tight text-slate-950">
                {card.value}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-300 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black text-slate-950">Centro de alertas criticas</h2>
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${alertCount > 0 ? "bg-rose-600 text-white shadow-lg shadow-rose-200" : "bg-slate-100 text-slate-600"}`}>
            {alertCount} alertas
          </span>
        </div>

        <div className="mt-6 grid gap-4">
          {systemAlerts.length === 0 ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-10 text-center">
              <div className="text-lg font-bold text-emerald-900">Flota al dia</div>
              <p className="mt-1 text-sm font-medium text-emerald-700">
                No hay alertas de vencimientos o mantenimiento pendientes.
              </p>
            </div>
          ) : (
            systemAlerts.map((item) => {
              const isUrgent = item.stateLabel === "Vencido";
              const href =
                item.categoryLabel === "Documento"
                  ? "/documents"
                  : item.categoryLabel === "Vencimiento"
                    ? "/expirations"
                    : "/maintenance";

              return (
                <div
                  key={`${item.categoryLabel}-${item.id}`}
                  className={`rounded-2xl border border-slate-200 pl-0 shadow-sm transition-all ${
                    isUrgent ? "bg-rose-50/50" : "bg-amber-50/50"
                  }`}
                >
                  <div className="flex items-stretch">
                    <div className={`w-2 rounded-l-2xl ${isUrgent ? "bg-rose-700" : "bg-amber-400"}`} />
                    <div className="flex-1 px-5 py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              isUrgent ? "bg-rose-600 text-white" : "bg-amber-500 text-white"
                            }`}>
                              {item.categoryLabel}
                            </span>
                            <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                          </div>
                          <div className="mt-1 text-base font-bold text-slate-800">
                            Vehiculo:{" "}
                            <span className="font-black text-slate-950 underline decoration-slate-300 underline-offset-4">
                              {item.vehicleLabel}
                            </span>
                          </div>
                        </div>
                        <div className={`rounded-xl border-2 px-4 py-2 text-center shadow-sm ${
                          isUrgent ? "border-rose-600 bg-white text-rose-700" : "border-amber-500 bg-white text-amber-800"
                        }`}>
                          <div className="text-[10px] font-black uppercase tracking-tighter opacity-70">Estado</div>
                          <div className="text-sm font-black uppercase">{item.stateLabel}</div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-slate-200/60 pt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-600">Referencia:</span>
                          <span className="text-sm font-black text-slate-950">{item.dueLabel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-600">Detalle:</span>
                          <span className={`text-sm font-black ${isUrgent ? "text-rose-700" : "text-amber-700"}`}>
                            {item.detail}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Link
                          href={href}
                          className={`inline-flex min-h-12 items-center rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.12em] transition ${
                            isUrgent
                              ? "bg-rose-700 text-white hover:bg-rose-800"
                              : "bg-amber-400 text-slate-950 hover:bg-amber-300"
                          }`}
                        >
                          Resolver ahora
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-slate-300 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-950">Vencimientos proximos</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              {upcomingExpirations.length}
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {upcomingExpirations.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">
                Todo bajo control.
              </div>
            ) : (
              upcomingExpirations.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-black text-slate-950">{item.title}</div>
                      <div className="text-sm font-bold text-slate-700">{item.vehicleLabel}</div>
                    </div>
                    <span className={`rounded-lg px-3 py-1 text-xs font-black uppercase ${item.stateTone}`}>
                      {item.stateLabel}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200/50 pt-2 text-xs">
                    <span className="font-black text-slate-800">{item.dueDate}</span>
                    <span className="font-bold text-slate-600">{item.detail}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-300 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-950">Mantenimiento proximo</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              {upcomingMaintenance.length}
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {upcomingMaintenance.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">
                Sin mantenimientos pendientes.
              </div>
            ) : (
              upcomingMaintenance.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-black text-slate-950">{item.title}</div>
                      <div className="text-sm font-bold text-slate-700">{item.vehicleLabel}</div>
                    </div>
                    <span className={`rounded-lg px-3 py-1 text-xs font-black uppercase ${item.stateTone}`}>
                      {item.stateLabel}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200/50 pt-2 text-xs">
                    <span className="font-black text-slate-800">{item.dueLabel}</span>
                    <span className="font-bold text-slate-600">{item.detail}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
