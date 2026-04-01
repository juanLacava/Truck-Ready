import { EnvAlert } from "@/components/env-alert";
import { FounderLeadForm } from "@/components/founder-lead-form";

function BenefitIcon({
  kind,
}: {
  kind: "folder" | "shield" | "bell" | "check" | "alert" | "error";
}) {
  const icons = {
    folder: (
      <svg viewBox="0 0 24 24" className="h-10 w-10 text-slate-950" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" className="h-10 w-10 text-slate-950" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    bell: (
      <svg viewBox="0 0 24 24" className="h-10 w-10 text-slate-950 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    alert: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-amber-700" fill="none" stroke="currentColor" strokeWidth="3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-rose-700" fill="none" stroke="currentColor" strokeWidth="3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };
  return icons[kind];
}

const statusCards = [
  {
    plate: "TRK-204",
    driver: "Inspeccion Anual: OK",
    label: "Ready",
    tone: "border-emerald-500 bg-emerald-50 text-emerald-950",
    dot: "bg-emerald-600",
  },
  {
    plate: "TRK-118",
    driver: "Seguro vence en 12 dias",
    label: "Atencion",
    tone: "border-amber-500 bg-amber-50 text-amber-950",
    dot: "bg-amber-600",
  },
  {
    plate: "TRK-091",
    driver: "CDL de chofer: Expirada",
    label: "Vencido",
    tone: "border-rose-600 bg-rose-50 text-rose-950",
    dot: "bg-rose-600",
  },
];

const complianceStates = [
  {
    icon: "check",
    title: "Ready",
    detail: "Inspeccion Anual: OK",
    body: "Todo al dia. Circula con tranquilidad ante cualquier inspeccion DOT.",
    tone: "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm",
  },
  {
    icon: "alert",
    title: "Proximo",
    detail: "Seguro vence en 12 dias",
    body: "Recibe alertas preventivas antes de que los documentos se conviertan en multas.",
    tone: "border-amber-500 bg-amber-50 text-amber-950 shadow-sm",
  },
  {
    icon: "error",
    title: "Vencido",
    detail: "CDL de chofer: Expirada",
    body: "Riesgo inminente de fuera de servicio (OOS) y multas costosas.",
    tone: "border-rose-600 bg-rose-50 text-rose-950 shadow-sm",
  },
];

const authorityItems = [
  "Disenado para operaciones que necesitan estar listas ante inspecciones, renovaciones y revisiones de seguros.",
  "Nuestra herramienta ayuda a transportistas independientes a anticipar vencimientos criticos antes de que se conviertan en multas.",
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[40px] border-2 border-slate-300 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.12)] md:p-14">
          <div className="grid gap-12 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-lg border-2 border-emerald-500 bg-emerald-50 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-emerald-900">
                Truck Ready
              </div>
              <h1 className="mt-8 max-w-2xl text-5xl font-black tracking-tighter text-slate-950 md:text-8xl leading-[0.9]">
                Tu camion,<br />siempre Ready.
              </h1>
              <p className="mt-8 max-w-2xl text-xl font-bold leading-relaxed text-slate-800 md:text-2xl">
                Controla vencimientos, mantenimiento y documentos en un solo
                lugar antes de tu proxima inspeccion.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#operadores-fundadores"
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-10 py-5 text-lg font-black text-white shadow-[0_15px_35px_rgba(16,185,129,0.35)] transition hover:bg-emerald-700 hover:-translate-y-1 active:translate-y-0"
                >
                  Unete como Operador Fundador (70% OFF)
                </a>
                <a
                  href="#semaforo"
                  className="inline-flex items-center justify-center rounded-2xl border-2 border-slate-300 px-10 py-5 text-lg font-black text-slate-950 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Ver como funciona
                </a>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-2">
                {authorityItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border-2 border-slate-200 bg-slate-50 px-6 py-6 text-base font-bold leading-relaxed text-slate-800"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 content-center">
              <div className="rounded-[40px] border-2 border-slate-300 bg-slate-100 p-6 shadow-xl">
                <div className="rounded-[32px] border-2 border-slate-300 bg-white p-8 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                        Central de cumplimiento
                      </div>
                      <div className="mt-3 text-3xl font-black tracking-tighter text-slate-950 leading-none">
                        Tu flota en 3 segundos.
                      </div>
                    </div>
                    <div className="rounded-xl border-2 border-slate-950 bg-slate-950 px-3 py-2 text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                      Live
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4">
                    {statusCards.map((card) => (
                      <div
                        key={card.plate}
                        className={`rounded-2xl border-2 px-6 py-5 shadow-sm transition-all hover:translate-x-2 ${card.tone}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-xl font-black tracking-tight leading-none">{card.plate}</div>
                            <div className="mt-2 text-sm font-bold opacity-90 leading-tight">{card.driver}</div>
                          </div>
                          <div className="flex items-center gap-3 rounded-xl bg-white/90 px-4 py-2 text-[11px] font-black uppercase tracking-widest shadow-sm">
                            <span className={`h-3 w-3 rounded-full ${card.dot} animate-pulse`} />
                            {card.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: "Beta", val: "10", sub: "Fundadores" },
                  { label: "Oferta", val: "-70%", sub: "De por vida" },
                  { label: "Enfoque", val: "DOT", sub: "Compliance" }
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-lg text-center">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      {item.label}
                    </div>
                    <div className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                      {item.val}
                    </div>
                    <div className="mt-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                      {item.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="semaforo" className="mt-12 rounded-[40px] border-2 border-slate-300 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:p-14">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
              Semaforo de Cumplimiento
            </div>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Toma el control.
            </h2>
            <p className="mt-6 max-w-2xl text-xl font-bold leading-relaxed text-slate-800">
              Nuestro sistema de alertas visuales te dice exactamente que necesita
              tu atencion hoy. Sin rodeos.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {complianceStates.map((state) => (
              <article
                key={state.title}
                className={`rounded-[36px] border-2 p-8 shadow-xl transition-all hover:-translate-y-2 ${state.tone}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="text-xs font-black uppercase tracking-widest opacity-60">
                    {state.title}
                  </div>
                  <BenefitIcon kind={state.icon as any} />
                </div>
                <h3 className="mt-4 text-4xl font-black tracking-tight">
                  {state.title}
                </h3>
                <div className="mt-6 rounded-xl bg-white/60 border-2 border-black/5 px-5 py-4 text-base font-black text-slate-950 leading-tight">
                  {state.detail}
                </div>
                <p className="mt-6 text-lg font-bold leading-relaxed text-slate-800">{state.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[40px] border-2 border-slate-300 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:p-14">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
              Beneficios Concretos
            </div>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Operacion Blindada.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <article className="rounded-[36px] border-2 border-slate-300 bg-slate-50 p-10 shadow-lg lg:col-span-2">
              <div className="flex items-start justify-between gap-8">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-600">
                    Boveda Bilingue
                  </div>
                  <h3 className="mt-6 text-4xl font-black tracking-tight text-slate-950 leading-tight">
                    Tus papeles en ingles para el inspector, en espanol para ti.
                  </h3>
                </div>
                <div className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm shrink-0">
                  <BenefitIcon kind="folder" />
                </div>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {["CDL", "Polizas", "DOT / Inspecciones"].map(doc => (
                  <div key={doc} className="rounded-xl border-2 border-slate-300 bg-white px-6 py-5 text-sm font-black text-slate-950 text-center uppercase tracking-widest shadow-sm">
                    {doc}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[36px] border-2 border-slate-300 bg-slate-50 p-10 shadow-lg flex flex-col justify-between text-center">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-600">
                  Historial PDF
                </div>
                <div className="mt-6 text-3xl font-black tracking-tight text-slate-950 leading-tight">
                  Exporta y negocia tu prima.
                </div>
              </div>
              <div className="mt-10 flex justify-center">
                <div className="rounded-2xl border-2 border-slate-300 bg-white p-8 shadow-sm">
                  <BenefitIcon kind="shield" />
                </div>
              </div>
            </article>

            <article className="rounded-[36px] border-2 border-slate-300 bg-slate-50 p-10 shadow-lg text-center">
              <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-600">
                Evita Multas
              </div>
              <div className="mt-6 text-3xl font-black tracking-tight text-slate-950 leading-tight">
                Detecta fallos antes que el DOT.
              </div>
              <div className="mt-10 flex justify-center opacity-20">
                <svg className="h-20 w-20 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </article>

            <article className="rounded-[36px] border-2 border-slate-300 bg-slate-50 p-10 shadow-lg text-center">
              <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-600">
                Notificaciones
              </div>
              <div className="mt-6 text-3xl font-black tracking-tight text-slate-950 leading-tight">
                Avisos reales en tiempo real.
              </div>
              <div className="mt-10 flex justify-center">
                <div className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm">
                  <BenefitIcon kind="bell" />
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="operadores-fundadores" className="mt-12 grid gap-8 rounded-[40px] border-2 border-slate-300 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:p-14 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[36px] bg-slate-950 p-10 text-white shadow-2xl border-2 border-slate-800">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400">
              Operadores Fundadores
            </div>
            <h2 className="mt-6 text-5xl font-black tracking-tighter leading-tight">
              Se parte del origen.
            </h2>
            <p className="mt-8 text-xl font-bold leading-relaxed text-slate-400">
              Herramienta hecha para el transportista hispano en EE. UU. Buscamos a los primeros 10.
            </p>

            <div className="mt-12 grid gap-4">
              {[
                "Acceso total anticipado.",
                "70% OFF de por vida.",
                "Soporte directo con fundadores."
              ].map(text => (
                <div key={text} className="rounded-2xl bg-white/5 border-2 border-white/10 px-6 py-5 text-lg font-black text-slate-100 flex items-center gap-5">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  {text}
                </div>
              ))}
            </div>
          </article>

          <FounderLeadForm />
        </section>

        <EnvAlert />
      </div>
    </main>
  );
}
