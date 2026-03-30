import { DashboardLayout } from "@/components/dashboard-layout";

export function DashboardContent({
  companyName,
  vehicleCount,
  expirationCount,
  maintenanceCount,
  serviceCount,
  upcomingExpirations,
  upcomingMaintenance,
}: {
  companyName: string;
  vehicleCount: number;
  expirationCount: number;
  maintenanceCount: number;
  serviceCount: number;
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
}) {
  const cards = [
    { label: "Unidades activas", value: String(vehicleCount) },
    { label: "Vencimientos activos", value: String(expirationCount) },
    { label: "Planes activos", value: String(maintenanceCount) },
    { label: "Servicios registrados", value: String(serviceCount) },
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      description={`Resumen inicial de ${companyName}. Desde aqui se controlaran pendientes, proximos vencimientos y estado general de la operacion.`}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm"
          >
            <div className="text-sm text-slate-500">{card.label}</div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">
              {card.value}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Estado inicial</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
            Ya hay conexion real con Supabase para empresas, unidades, vencimientos, mantenimiento y servicios.
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
            Siguiente modulo en foco: listados de pendientes y documentos por unidad.
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-900">Vencimientos por atender</h2>
            <span className="text-sm text-slate-500">{upcomingExpirations.length}</span>
          </div>

          <div className="mt-5 grid gap-3">
            {upcomingExpirations.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No hay vencimientos proximos ni vencidos.
              </div>
            ) : (
              upcomingExpirations.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200/70 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <div className="mt-1 text-sm text-slate-600">{item.vehicleLabel}</div>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${item.stateTone}`}
                    >
                      {item.stateLabel}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-700">{item.dueDate}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.detail}</div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-900">Mantenimiento por atender</h2>
            <span className="text-sm text-slate-500">{upcomingMaintenance.length}</span>
          </div>

          <div className="mt-5 grid gap-3">
            {upcomingMaintenance.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No hay planes proximos ni vencidos.
              </div>
            ) : (
              upcomingMaintenance.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200/70 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <div className="mt-1 text-sm text-slate-600">{item.vehicleLabel}</div>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${item.stateTone}`}
                    >
                      {item.stateLabel}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-700">{item.dueLabel}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.detail}</div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
