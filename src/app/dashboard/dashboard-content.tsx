import { DashboardLayout } from "@/components/dashboard-layout";

export function DashboardContent({
  companyName,
  vehicleCount,
  expirationCount,
  maintenanceCount,
  serviceCount,
}: {
  companyName: string;
  vehicleCount: number;
  expirationCount: number;
  maintenanceCount: number;
  serviceCount: number;
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
            Ya hay conexion real con Supabase para empresas, unidades y vencimientos.
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
            Siguiente modulo en foco: mantenimiento preventivo y servicios realizados.
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
