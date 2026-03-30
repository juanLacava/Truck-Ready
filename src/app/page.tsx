import { EnvAlert } from "@/components/env-alert";

const metrics = [
  { label: "Mercados iniciales", value: "3", detail: "Florida, California y New York" },
  { label: "Ticket objetivo", value: "USD 49+", detail: "por empresa al mes" },
  { label: "Tamano ideal", value: "5 a 30", detail: "vehiculos por empresa" },
];

const pendingItems = [
  "Spanish-first onboarding para duenos y operadores",
  "Posicionamiento para mercado hispano en EE. UU.",
  "Primer foco comercial: Florida, California y New York",
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-[0_20px_80px_rgba(48,57,37,0.08)] backdrop-blur">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800">
                Flota al Dia
              </span>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                Mantenimiento y vencimientos para negocios hispanos con vehiculos en EE. UU.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                Base inicial del MVP. El objetivo es centralizar unidades,
                vencimientos, planes preventivos e historial para empresas
                hispanas de Florida, California y New York, sin cargar
                complejidad innecesaria.
              </p>
            </div>

            <div className="rounded-3xl bg-brand-900 px-5 py-4 text-sm text-brand-50">
              Estado actual del repo
              <div className="mt-2 text-2xl font-semibold">Arquitectura lista</div>
              <div className="mt-1 text-brand-100">
                Foco comercial actualizado a mercado hispano en EE. UU.
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_10px_40px_rgba(31,41,55,0.06)]"
            >
              <div className="text-sm text-slate-500">{metric.label}</div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">
                {metric.value}
              </div>
              <div className="mt-2 text-sm text-slate-600">{metric.detail}</div>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <article className="rounded-3xl border border-slate-200/70 bg-white/90 p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Modulos definidos para la V1
            </h2>
            <ul className="mt-5 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Autenticacion</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Empresas</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Unidades</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Vencimientos</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">
                Mantenimiento preventivo
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">
                Servicios realizados
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Historial</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Dashboard</li>
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-200/70 bg-white/90 p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Prioridades del enfoque comercial
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              {pendingItems.map((item) => (
                <li key={item} className="rounded-2xl bg-amber-50 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <EnvAlert />
      </div>
    </main>
  );
}
