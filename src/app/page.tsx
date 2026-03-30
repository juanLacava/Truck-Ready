import { EnvAlert } from "@/components/env-alert";
import { FounderLeadForm } from "@/components/founder-lead-form";

const statusCards = [
  {
    plate: "TRK-204",
    driver: "Inspeccion Anual: OK",
    label: "Ready",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  {
    plate: "TRK-118",
    driver: "Seguro vence en 12 dias",
    label: "Atencion",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  {
    plate: "TRK-091",
    driver: "CDL de chofer: Expirada",
    label: "Vencido",
    tone: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
];

const complianceStates = [
  {
    icon: "Ready",
    title: "Ready",
    detail: "Inspeccion Anual: OK",
    body: "Todo al dia. Circula con tranquilidad.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    icon: "Atencion",
    title: "Proximo",
    detail: "Seguro vence en 12 dias",
    body: "Mantenimiento o documento por vencer en los proximos 15-30 dias.",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    icon: "Vencido",
    title: "Vencido",
    detail: "CDL de chofer: Expirada",
    body: "Riesgo inminente de multa o fuera de servicio.",
    tone: "border-rose-200 bg-rose-50 text-rose-800",
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
        <section className="rounded-[36px] border border-slate-200/80 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.06)] md:p-10">
          <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Truck Ready
              </div>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-slate-800 md:text-6xl">
                Tu camion, siempre Ready.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                Controla vencimientos, mantenimiento y documentos en un solo
                lugar antes de tu proxima inspeccion.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#operadores-fundadores"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#10B981] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,185,129,0.28)] transition hover:bg-[#0ea271]"
                >
                  Unete como Operador Fundador (70% OFF)
                </a>
                <a
                  href="#semaforo"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Ver como funciona
                </a>
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-2">
                {authorityItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-4 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Central de cumplimiento
                      </div>
                      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-800">
                        Tu flota, bajo control en 3 segundos.
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                      Live Status
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {statusCards.map((card) => (
                      <div
                        key={card.plate}
                        className={`rounded-2xl border px-4 py-4 ${card.tone}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold">{card.plate}</div>
                            <div className="mt-1 text-sm opacity-90">{card.driver}</div>
                          </div>
                          <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                            <span className={`h-2.5 w-2.5 rounded-full ${card.dot}`} />
                            {card.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Beta
                  </div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">
                    10
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    Operadores Fundadores
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Oferta
                  </div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">
                    -70%
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    De por vida en tu suscripcion
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Enfoque
                  </div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">
                    DOT
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    Seguros, vencimientos y mantenimiento
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="semaforo"
          className="mt-8 rounded-[36px] border border-slate-200/80 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:p-10"
        >
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Semaforo de Cumplimiento
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-800 md:text-4xl">
              Toma el control en 3 segundos.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              No pierdas mas tiempo revisando papeles o fotos de WhatsApp.
              Nuestro sistema de alertas visuales te dice exactamente que necesita
              tu atencion hoy.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {complianceStates.map((state) => (
              <article
                key={state.title}
                className={`rounded-[30px] border p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] ${state.tone}`}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.22em]">
                  {state.icon}
                </div>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                  {state.title}
                </h3>
                <div className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium">
                  {state.detail}
                </div>
                <p className="mt-4 text-sm leading-7 opacity-90">{state.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[36px] border border-slate-200/80 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:p-10">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Beneficios Concretos
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-800 md:text-4xl">
              Menos riesgo, mejor historial, cero caos.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <article className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_12px_36px_rgba(15,23,42,0.04)] lg:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Boveda de Documentos Bilingue
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-800">
                    Tus papeles en ingles para el inspector, en espanol para ti.
                  </h3>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-2xl">
                  Folder US/MX
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                  CDL
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                  Polizas
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                  Inspecciones
                </div>
              </div>
            </article>

            <article className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Historial para Seguros
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-800">
                Exporta tu historial en PDF y negocia tu prima.
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                Shield PDF
              </div>
            </article>

            <article className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Menos riesgo de multas
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-800">
                Detecta documentos vencidos antes que el inspector.
              </div>
            </article>

            <article className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Alertas WhatsApp
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-800">
                Te avisamos antes de que sea tarde.
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                Bell upcoming alerts
              </div>
            </article>
          </div>
        </section>

        <section
          id="operadores-fundadores"
          className="mt-8 grid gap-6 rounded-[36px] border border-slate-200/80 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:p-10 xl:grid-cols-[0.95fr_1.05fr]"
        >
          <article className="rounded-[30px] bg-slate-900 p-7 text-white shadow-[0_16px_45px_rgba(15,23,42,0.24)]">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Operadores Fundadores
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
              Buscamos a los primeros 10 Operadores Fundadores.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Estamos lanzando una herramienta hecha para el transportista hispano
              en EE. UU. y queremos que seas parte del origen.
            </p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl bg-white/10 px-4 py-4 text-sm text-slate-100">
                Acceso anticipado a todas las funciones.
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-4 text-sm text-slate-100">
                70% de descuento de por vida en tu suscripcion.
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-4 text-sm text-slate-100">
                Soporte prioritario y canal directo con los fundadores.
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-300">
              Disenado para operaciones que necesitan estar listas ante
              inspecciones, renovaciones y revisiones de seguros.
            </div>
          </article>

          <FounderLeadForm />
        </section>

        <EnvAlert />
      </div>
    </main>
  );
}
