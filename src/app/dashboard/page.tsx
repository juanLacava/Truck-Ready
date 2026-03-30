"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardContent } from "@/app/dashboard/dashboard-content";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type Membership = {
  company_id: string;
  role: string;
  companies: {
    name: string;
    country: string | null;
  } | null;
};

type DashboardState = {
  companyName: string;
  vehicleCount: number;
  expirationCount: number;
  maintenanceCount: number;
  serviceCount: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<DashboardState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace("/login");
          return;
        }

        const { data: membership, error: membershipError } = await supabase
          .from("company_members")
          .select("company_id, role, companies(name, country)")
          .eq("profile_id", session.user.id)
          .limit(1)
          .returns<Membership[]>()
          .maybeSingle();

        if (membershipError) {
          throw membershipError;
        }

        if (!membership) {
          router.replace("/onboarding");
          return;
        }

        const [{ count: vehicleCount, error: vehiclesError }, { count: expirationCount, error: expirationsError }, { count: maintenanceCount, error: maintenanceError }, { count: serviceCount, error: servicesError }] =
          await Promise.all([
            supabase
              .from("vehicles")
              .select("*", { count: "exact", head: true })
              .eq("company_id", membership.company_id),
            supabase
              .from("expiration_items")
              .select("*", { count: "exact", head: true })
              .eq("company_id", membership.company_id)
              .eq("status", "active"),
            supabase
              .from("maintenance_plans")
              .select("*", { count: "exact", head: true })
              .eq("company_id", membership.company_id)
              .eq("status", "active"),
            supabase
              .from("service_records")
              .select("*", { count: "exact", head: true })
              .eq("company_id", membership.company_id),
          ]);

        if (vehiclesError) throw vehiclesError;
        if (expirationsError) throw expirationsError;
        if (maintenanceError) throw maintenanceError;
        if (servicesError) throw servicesError;

        if (!isMounted) {
          return;
        }

        setState({
          companyName: membership.companies?.name ?? "Tu empresa",
          vehicleCount: vehicleCount ?? 0,
          expirationCount: expirationCount ?? 0,
          maintenanceCount: maintenanceCount ?? 0,
          serviceCount: serviceCount ?? 0,
        });
      } catch (loadError) {
        const detail =
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el dashboard.";

        if (isMounted) {
          setError(detail);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-800">
          {error}
        </div>
      </main>
    );
  }

  if (!state) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
          Cargando dashboard...
        </div>
      </main>
    );
  }

  return <DashboardContent {...state} />;
}
