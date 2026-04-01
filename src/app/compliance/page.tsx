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
      description="Herramientas de cumplimiento DOT bilingue para pasar inspecciones con orden y profesionalismo."
    >
      <div className="grid gap-8 print:block">
        <section className="rounded-[40px] border-2 border-slate-300 bg-white p-8 shadow-xl print:rounded-none print:border-b-4 print:p-0 print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex rounded border-2 border-slate-950 bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-white">
                DOT Ready Sheet
              </div>
              <h2 className="mt-5 text-4xl font-black tracking-tighter text-slate-950 leading-none uppercase italic">
                Checklist pre-trip bilingue.
              </h2>
              <p className="mt-5 text-lg font-bold leading-relaxed text-slate-800">
                Este modulo convierte el cumplimiento en una rutina blindada. 
                Revisa lo critico antes de salir y usa el mismo lenguaje en espanol 
                para operar y en ingles para presentar soporte ante el DOT.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-2xl bg-emerald-600 px-8 py-4 text-base font-black uppercase tracking-widest text-white shadow-lg hover:bg-emerald-700 transition print:hidden"
            >
              Imprimir checklist
            </button>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3 print:mt-10">
          {checklistGroups.map((group) => (
            <article
              key={group.title}
              className="rounded-[36px] border-2 border-slate-300 bg-white p-8 shadow-lg break-inside-avoid"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                {group.enTitle}
              </div>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950 leading-tight">{group.title}</h3>

              <div className="mt-8 grid gap-4">
                {group.items.map((item) => (
                  <label
                    key={item.en}
                    className="flex gap-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 py-5 text-sm cursor-pointer transition hover:bg-white hover:border-slate-300 group"
                  >
                    <input type="checkbox" className="mt-1 h-5 w-5 rounded-md border-2 border-slate-400 text-emerald-600 focus:ring-emerald-500 transition cursor-pointer" />
                    <div>
                      <div className="font-black text-slate-950 text-base leading-tight group-hover:text-emerald-900 transition">{item.es}</div>
                      <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                        {item.en}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] print:mt-10">
          <article className="rounded-[40px] border-2 border-slate-300 bg-slate-950 p-10 shadow-2xl text-white">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
              Inspection Packet
            </div>
            <h3 className="mt-5 text-3xl font-black tracking-tight leading-tight">
              Documentacion lista para inspeccion.
            </h3>
            <div className="mt-8 grid gap-3">
              {inspectionPacket.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-2xl bg-white/10 border border-white/10 px-6 py-5 text-base font-bold text-slate-100"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[40px] border-2 border-slate-300 bg-white p-10 shadow-lg">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-600">
              Operational Notes
            </div>
            <h3 className="mt-5 text-3xl font-black tracking-tight text-slate-950 leading-tight">
              Usa Truck Ready como carpeta de defensa operativa.
            </h3>
            <div className="mt-8 grid gap-4">
              {authorityNotes.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-6 text-base font-bold leading-relaxed text-slate-800"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-6 py-6 text-base font-black text-emerald-900 leading-relaxed italic shadow-sm shadow-emerald-100">
              Siguiente combinacion recomendada: checklist DOT + documentos por unidad + 
              reporte exportable + alertas de vencimiento.
            </div>
          </article>
        </section>
      </div>
    </DashboardLayout>
  );
}
