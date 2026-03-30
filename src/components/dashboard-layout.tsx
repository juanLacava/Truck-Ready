"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/vehicles", label: "Unidades" },
  { href: "/expirations", label: "Vencimientos" },
  { href: "/maintenance", label: "Mantenimiento" },
];

type Membership = {
  company_id: string;
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

        const { data: memberships, error } = await supabase
          .from("company_members")
          .select("company_id, role, companies(name)")
          .eq("profile_id", session.user.id)
          .limit(1)
          .returns<Membership[]>();

        if (error) {
          throw error;
        }

        const membership = memberships?.[0] ?? null;

        if (!membership) {
          router.replace("/onboarding");
          return;
        }

        if (!isMounted) {
          return;
        }

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
    <div className="min-h-screen bg-[#eef1e7] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-slate-200 bg-brand-900 px-6 py-8 text-brand-50 lg:border-b-0 lg:border-r lg:border-brand-800">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Flota al Dia
          </Link>
          <p className="mt-2 text-sm text-brand-100">
            {companyName ?? "Flotilla sin configurar"}
          </p>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-brand-100 text-brand-900"
                      : "text-brand-100 hover:bg-brand-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl bg-brand-800/80 px-4 py-3 text-sm text-brand-100">
            <div className="font-medium text-white">{email ?? "Sin email"}</div>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-3 text-sm underline"
            >
              Cerrar sesion
            </button>
          </div>
        </aside>

        <div className="px-6 py-8 md:px-10">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {description}
              </p>
            ) : null}
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
