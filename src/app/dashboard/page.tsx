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
};

type DashboardExpiration = {
  id: string;
  title: string;
  due_date: string;
  alert_days_before: number;
  status: "active" | "completed" | "archived";
  vehicles: {
    internal_code: string | null;
    plate: string;
  } | null;
};

type DashboardMaintenance = {
  id: string;
  title: string;
  trigger_type: "date" | "odometer";
  next_due_date: string | null;
  next_due_odometer: number | null;
  status: "active" | "paused" | "archived";
  vehicles: {
    internal_code: string | null;
    plate: string;
    current_odometer: number;
  } | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getExpirationState(dueDate: string, alertDaysBefore: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(`${dueDate}T00:00:00`);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) {
    return {
      label: "Vencido",
      tone: "bg-rose-100 text-rose-800",
      detail: `${Math.abs(diffDays)} dias de atraso`,
    };
  }

  if (diffDays <= alertDaysBefore) {
    return {
      label: "Proximo",
      tone: "bg-amber-100 text-amber-800",
      detail: diffDays === 0 ? "Vence hoy" : `Faltan ${diffDays} dias`,
    };
  }

  return {
    label: "Al dia",
    tone: "bg-emerald-100 text-emerald-800",
    detail: `Faltan ${diffDays} dias`,
  };
}

function getMaintenanceState(plan: DashboardMaintenance) {
  if (plan.trigger_type === "date" && plan.next_due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(`${plan.next_due_date}T00:00:00`);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);

    if (diffDays < 0) {
      return {
        label: "Vencido",
        tone: "bg-rose-100 text-rose-800",
        detail: `${Math.abs(diffDays)} dias de atraso`,
      };
    }

    if (diffDays <= 7) {
      return {
        label: "Proximo",
        tone: "bg-amber-100 text-amber-800",
        detail: diffDays === 0 ? "Toca hoy" : `Faltan ${diffDays} dias`,
      };
    }

    return {
      label: "Al dia",
      tone: "bg-emerald-100 text-emerald-800",
      detail: `Faltan ${diffDays} dias`,
    };
  }

  if (plan.trigger_type === "odometer" && plan.next_due_odometer !== null) {
    const remaining = plan.next_due_odometer - (plan.vehicles?.current_odometer ?? 0);

    if (remaining < 0) {
      return {
        label: "Vencido",
        tone: "bg-rose-100 text-rose-800",
        detail: `${Math.abs(remaining).toLocaleString("en-US")} mi de atraso`,
      };
    }

    if (remaining <= 1000) {
      return {
        label: "Proximo",
        tone: "bg-amber-100 text-amber-800",
        detail:
          remaining === 0
            ? "Toca ahora"
            : `Faltan ${remaining.toLocaleString("en-US")} mi`,
      };
    }

    return {
      label: "Al dia",
      tone: "bg-emerald-100 text-emerald-800",
      detail: `Faltan ${remaining.toLocaleString("en-US")} mi`,
    };
  }

  return {
    label: "Sin base",
    tone: "bg-slate-100 text-slate-700",
    detail: "Faltan datos para calcular",
  };
}

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

        const [
          { count: vehicleCount, error: vehiclesError },
          { count: expirationCount, error: expirationsError },
          { count: maintenanceCount, error: maintenanceError },
          { count: serviceCount, error: servicesError },
          { data: expirationsData, error: expirationListError },
          { data: maintenanceData, error: maintenanceListError },
        ] =
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
            supabase
              .from("expiration_items")
              .select(
                "id, title, due_date, alert_days_before, status, vehicles(internal_code, plate)"
              )
              .eq("company_id", membership.company_id)
              .eq("status", "active")
              .order("due_date", { ascending: true })
              .limit(10)
              .returns<DashboardExpiration[]>(),
            supabase
              .from("maintenance_plans")
              .select(
                "id, title, trigger_type, next_due_date, next_due_odometer, status, vehicles(internal_code, plate, current_odometer)"
              )
              .eq("company_id", membership.company_id)
              .eq("status", "active")
              .returns<DashboardMaintenance[]>(),
          ]);

        if (vehiclesError) throw vehiclesError;
        if (expirationsError) throw expirationsError;
        if (maintenanceError) throw maintenanceError;
        if (servicesError) throw servicesError;
        if (expirationListError) throw expirationListError;
        if (maintenanceListError) throw maintenanceListError;

        if (!isMounted) {
          return;
        }

        const upcomingExpirations = (expirationsData ?? [])
          .map((item) => {
            const state = getExpirationState(item.due_date, item.alert_days_before);

            return {
              id: item.id,
              title: item.title,
              dueDate: `Vence el ${formatDate(item.due_date)}`,
              vehicleLabel: item.vehicles?.internal_code || item.vehicles?.plate || "-",
              detail: state.detail,
              stateLabel: state.label,
              stateTone: state.tone,
            };
          })
          .filter((item) => item.stateLabel !== "Al dia")
          .slice(0, 5);

        const upcomingMaintenance = (maintenanceData ?? [])
          .map((item) => {
            const state = getMaintenanceState(item);

            return {
              id: item.id,
              title: item.title,
              dueLabel:
                item.trigger_type === "date" && item.next_due_date
                  ? `Proximo: ${formatDate(item.next_due_date)}`
                  : `Proximo: ${item.next_due_odometer?.toLocaleString("en-US") ?? "-"} mi`,
              vehicleLabel: item.vehicles?.internal_code || item.vehicles?.plate || "-",
              detail: state.detail,
              stateLabel: state.label,
              stateTone: state.tone,
            };
          })
          .filter((item) => item.stateLabel !== "Al dia")
          .sort((a, b) => {
            if (a.stateLabel === b.stateLabel) {
              return 0;
            }

            if (a.stateLabel === "Vencido") {
              return -1;
            }

            if (b.stateLabel === "Vencido") {
              return 1;
            }

            return 0;
          })
          .slice(0, 5);

        setState({
          companyName: membership.companies?.name ?? "Tu empresa",
          vehicleCount: vehicleCount ?? 0,
          expirationCount: expirationCount ?? 0,
          maintenanceCount: maintenanceCount ?? 0,
          serviceCount: serviceCount ?? 0,
          upcomingExpirations,
          upcomingMaintenance,
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
