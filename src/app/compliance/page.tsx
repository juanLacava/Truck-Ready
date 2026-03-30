"use client";

import { DashboardLayout } from "@/components/dashboard-layout";

export const dynamic = "force-dynamic";

const checklistGroups = [
  {
    title: "Cabina y documentos",
    enTitle: "Cab & paperwork",
    items: [
      {
        es: "Licencia, registro y seguro accesibles",
        en: "License, registration and insurance accessible",
      },
      {
        es: "ELD o logbook listo para mostrar",
        en: "ELD or logbook ready to present",
      },
      {
        es: "Tarjeta de inspeccion anual vigente",
        en: "Current annual inspection proof available",
      },
      {
        es: "Permisos y documentos especiales actualizados",
        en: "Permits and special documents up to date",
      },
    ],
  },
  {
    title: "Exterior y seguridad",
    enTitle: "Exterior & safety",
    items: [
      {
        es: "Luces, reflectores y senales funcionando",
        en: "Lights, reflectors and signals working",
      },
      {
        es: "Llantas, tuercas y presion sin danos visibles",
        en: "Tires, lug nuts and pressure show no visible issues",
      },
      {
        es: "Espejos, parabrisas y limpiaparabrisas en condicion segura",
        en: "Mirrors, windshield and wipers are safe to operate",
      },
      {
        es: "Extintor, triangulos y kit de emergencia a bordo",
        en: "Fire extinguisher, triangles and emergency kit on board",
      },
    ],
  },
  {
    title: "Operacion mecanica",
    enTitle: "Mechanical operation",
    items: [
      {
        es: "Frenos, presion de aire y warnings sin anomalias",
        en: "Brakes, air pressure and warnings show no anomalies",
      },
      {
        es: "Fugas visibles de aceite, coolant o combustible",
        en: "No visible oil, coolant or fuel leaks",
      },
      {
        es: "Direccion y suspension sin ruido o juego excesivo",
        en: "Steering and suspension show no excessive play or noise",
      },
      {
        es: "Acople, quinta rueda y conexiones seguras",
        en: "Coupling, fifth wheel and connections are secure",
      },
    ],
  },
];

const inspectionPacket = [
  "Insurance policy and ID cards",
  "Vehicle registration and ownership support",
  "Annual inspection proof",
  "Maintenance history report",
  "Driver CDL and medical documents",
  "Required permits for current route or load",
];

const authorityNotes = [
  "Usa esta lista como pre-trip operativo, no como reemplazo de asesoramiento legal.",
  "El valor comercial aca es simple: llegar a una inspeccion con papeles y unidad en condicion de mostrar orden.",
  "Combina este checklist con vencimientos, documentos y reportes exportables para armar tu carpeta de defensa operativa.",
];

export default function CompliancePage() {
  return (
    <DashboardLayout
      title="Compliance"
      description="Checklist DOT bilingue y paquete base de inspeccion para owner-operators y micro-flotas."
    >
      <div className="grid gap-6 print:block">
        <section className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                DOT Ready Sheet
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Checklist pre-trip bilingue para inspecciones y seguros.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Este modulo convierte el concepto de compliance en una rutina simple.
                Revisa lo critico antes de salir y usa el mismo lenguaje en espanol
                para operar y en ingles para presentar soporte.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white print:hidden"
            >
              Imprimir checklist
            </button>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3 print:mt-8">
          {checklistGroups.map((group) => (
            <article
              key={group.title}
              className="rounded-[30px] border border-slate-200/70 bg-white p-6 shadow-sm break-inside-avoid"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {group.enTitle}
              </div>
              <h3 className="mt-3 text-xl font-semibold text-slate-950">{group.title}</h3>

              <div className="mt-5 grid gap-3">
                {group.items.map((item) => (
                  <label
                    key={item.en}
                    className="flex gap-3 rounded-2xl border border-slate-200 px-4 py-4 text-sm text-slate-700"
                  >
                    <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300" />
                    <div>
                      <div className="font-medium text-slate-900">{item.es}</div>
                      <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                        {item.en}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] print:mt-8">
          <article className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Inspection Packet
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Que deberias tener listo cuando te piden respaldo.
            </h3>
            <div className="mt-5 grid gap-3">
              {inspectionPacket.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-sm text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Operational Notes
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Como usar Truck Ready como carpeta de defensa operativa.
            </h3>
            <div className="mt-5 grid gap-3">
              {authorityNotes.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-5 text-sm leading-6 text-emerald-900">
              Siguiente combinacion recomendada: checklist DOT + documentos por unidad +
              reporte exportable + alertas de vencimiento.
            </div>
          </article>
        </section>
      </div>
    </DashboardLayout>
  );
}
