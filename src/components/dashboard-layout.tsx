"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMemberships, setActiveCompanyId } from "@/lib/company-membership";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/alerts", label: "Alertas" },
  { href: "/compliance", label: "Compliance" },
  { href: "/vehicles", label: "Unidades" },
  { href: "/documents", label: "Documentos" },
  { href: "/expirations", label: "Vencimientos" },
  { href: "/maintenance", label: "Mantenimiento" },
  { href: "/services", label: "Servicios" },
];

type Membership = {
  company_id: string;
  created_at: string;
  role: string;
  companies: {
    name: string;
  } | null;
};

export type DashboardMembership = Membership;

export function DashboardLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [activeCompanyId, setCurrentActiveCompanyId] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace("/login");
          return;
        }

        if (!isMounted) {
          return;
        }

        setEmail(session.user.email ?? null);

        const membershipsData = await getMemberships<Membership>(
          supabase,
          session.user.id,
          "company_id, created_at, role, companies(name)"
        );

        const savedCompanyId =
          typeof window === "undefined"
            ? null
            : window.localStorage.getItem("truck-ready.active-company-id");
        const membership =
          membershipsData.find((item) => item.company_id === savedCompanyId) ?? membershipsData[0] ?? null;

        if (!membership) {
          router.replace("/onboarding");
          return;
        }

        if (!isMounted) {
          return;
        }

        setMemberships(membershipsData);
        setCurrentActiveCompanyId(membership.company_id);
        setCompanyName(membership.companies?.name ?? null);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  function handleCompanyChange(nextCompanyId: string) {
    setActiveCompanyId(nextCompanyId);
    setCurrentActiveCompanyId(nextCompanyId);
    const nextMembership = memberships.find((membership) => membership.company_id === nextCompanyId);
    setCompanyName(nextMembership?.companies?.name ?? null);
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
          Cargando sesion...
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f5ed] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[260px_1fr]">
        <aside className="border-b-2 border-slate-300 bg-slate-950 px-6 py-10 text-white lg:border-b-0 lg:border-r-2 lg:border-slate-950">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase italic">
            Truck Ready
          </Link>
          {memberships.length > 1 ? (
            <div className="mt-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Empresa activa
              </label>
              <select
                value={activeCompanyId ?? ""}
                onChange={(event) => handleCompanyChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-emerald-500/20 bg-slate-900 px-3 py-2 text-sm font-bold text-white outline-none transition focus:border-emerald-400"
              >
                {memberships.map((membership) => (
                  <option key={membership.company_id} value={membership.company_id}>
                    {membership.companies?.name ?? "Empresa"}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mt-4 inline-flex rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
              {companyName ?? "Flotilla"}
            </div>
          )}

          <nav className="mt-12 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-black transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-12 rounded-2xl border-2 border-slate-800 bg-slate-900/50 p-5 shadow-inner">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">Sesion</div>
            <div className="mt-2 text-sm font-bold text-slate-200 truncate">{email ?? "Sin email"}</div>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-4 w-full rounded-xl border-2 border-rose-900/50 bg-rose-950/20 py-2 text-xs font-black uppercase tracking-widest text-rose-400 transition hover:bg-rose-950 hover:text-white"
            >
              Cerrar sesion
            </button>
          </div>
        </aside>

        <div className="px-6 py-10 md:px-12 overflow-x-hidden">
          <header className="mb-10">
            <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase">{title}</h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-lg font-bold leading-relaxed text-slate-800">
                {description}
              </p>
            ) : null}
          </header>

          <div key={activeCompanyId ?? "no-company"} className="relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
