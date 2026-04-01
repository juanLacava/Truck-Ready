"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { VehicleForm } from "@/components/vehicle-form";
import { getActiveMembership } from "@/lib/company-membership";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type Vehicle = {
  id: string;
  internal_code: string | null;
  plate: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  current_odometer: number;
  status: string;
};

type VehicleMembership = {
  company_id: string;
  created_at: string;
  role: "owner" | "admin" | "operator";
};

function getVehicleTone(status: string) {
  if (status === "active") {
    return {
      badge: "border-emerald-500 bg-emerald-50 text-emerald-900",
      accent: "bg-emerald-500",
    };
  }

  if (status === "maintenance") {
    return {
      badge: "border-amber-400 bg-amber-50 text-amber-900",
      accent: "bg-amber-400",
    };
  }

  return {
    badge: "border-slate-400 bg-slate-100 text-slate-700",
    accent: "bg-slate-500",
  };
}

export default function VehiclesPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [role, setRole] = useState<VehicleMembership["role"] | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    async function loadVehicles() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace("/login");
          return;
        }

        const membership = await getActiveMembership<VehicleMembership>(
          supabase,
          session.user.id,
          "company_id, created_at, role"
        );

        if (!membership) {
          router.replace("/onboarding");
          return;
        }

        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from("vehicles")
          .select("id, internal_code, plate, brand, model, year, current_odometer, status")
          .eq("company_id", membership.company_id)
          .order("created_at", { ascending: false })
          .returns<Vehicle[]>();

        if (vehiclesError) {
          throw vehiclesError;
        }

        if (!isMounted) {
          return;
        }

        setCompanyId(membership.company_id);
        setRole(membership.role);
        setVehicles(vehiclesData ?? []);
      } catch (loadError) {
        const detail =
          loadError instanceof Error ? loadError.message : "No se pudieron cargar las unidades.";

        if (isMounted) {
          setError(detail);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadVehicles();

    return () => {
      isMounted = false;
    };
  }, [router]);

  function updateVehicleOdometer(vehicleId: string, delta: number) {
    if (!companyId || role === "operator") {
      return;
    }

    const currentVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);

    if (!currentVehicle) {
      return;
    }

    const nextOdometer = Math.max(0, currentVehicle.current_odometer + delta);

    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === vehicleId ? { ...vehicle, current_odometer: nextOdometer } : vehicle
      )
    );

    startTransition(async () => {
      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase
        .from("vehicles")
        .update({ current_odometer: nextOdometer })
        .eq("id", vehicleId)
        .eq("company_id", companyId);

      if (updateError) {
        setVehicles((current) =>
          current.map((vehicle) =>
            vehicle.id === vehicleId
              ? { ...vehicle, current_odometer: currentVehicle.current_odometer }
              : vehicle
          )
        );
        setError(updateError.message);
      }
    });
  }

  return (
    <DashboardLayout
      title="Unidades"
      description="Modulo de administracion de flota. Aqui puedes cargar nuevas unidades y gestionar el estado operativo de cada vehiculo."
    >
      <section className="mb-6 rounded-[32px] border-2 border-slate-300 bg-slate-950 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300">
              Vehicle ID Cards
            </div>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tight">Fleet registry</h2>
          </div>
          <Link
            href="/documents"
            className="rounded-2xl border-2 border-white/15 bg-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-slate-950"
          >
            Document vault
          </Link>
        </div>
        <p className="mt-4 max-w-3xl text-sm font-bold leading-relaxed text-slate-300">
          Cada unidad se muestra como identificacion operativa. El odometro queda al centro y el acceso al historial o a la boveda documental sale directo desde la tarjeta.
        </p>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-6 md:grid-cols-2">
          {isLoading ? (
            <div className="md:col-span-2 rounded-[36px] border-2 border-slate-300 bg-white px-6 py-16 text-center text-base font-bold text-slate-700 shadow-lg">
              Cargando flota...
            </div>
          ) : error ? (
            <div className="md:col-span-2 rounded-[36px] border-2 border-rose-200 bg-rose-50 px-6 py-16 text-center text-base font-bold text-rose-800 shadow-lg">
              {error}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="md:col-span-2 rounded-[36px] border-2 border-slate-300 bg-white px-6 py-16 text-center text-base font-bold text-slate-700 shadow-lg">
              Aun no hay unidades cargadas.
            </div>
          ) : (
            vehicles.map((vehicle) => {
              const tone = getVehicleTone(vehicle.status);
              const vehicleName = [vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(" ") || "Unidad sin detalle";

              return (
                <article
                  key={vehicle.id}
                  className="relative overflow-hidden rounded-[28px] border-2 border-slate-300 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.10)]"
                >
                  <div className={`h-2 w-full ${tone.accent}`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                          Vehicle ID
                        </div>
                        <Link href={`/vehicles/${vehicle.id}`} className="mt-2 block text-3xl font-black uppercase tracking-tight text-slate-950 hover:text-emerald-700">
                          {vehicle.plate}
                        </Link>
                        <div className="mt-2 text-sm font-bold text-slate-700">
                          {vehicle.internal_code ?? "Sin codigo interno"}
                        </div>
                      </div>
                      <span className={`inline-flex rounded-xl border-2 px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] ${tone.badge}`}>
                        {vehicle.status}
                      </span>
                    </div>

                    <div className="mt-5 rounded-[24px] border-2 border-slate-200 bg-slate-50 p-5">
                      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                        Assigned unit
                      </div>
                      <div className="mt-2 text-lg font-black text-slate-950">{vehicleName}</div>
                    </div>

                    <div className="mt-5 rounded-[24px] border-2 border-slate-950 bg-slate-950 p-5 text-white">
                      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                        Odometer
                      </div>
                      <div className="mt-4 grid grid-cols-[64px_1fr_64px] items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateVehicleOdometer(vehicle.id, -100)}
                          disabled={role === "operator" || isUpdating}
                          className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/15 bg-white/5 text-3xl font-black text-white transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          -
                        </button>
                        <div className="text-center font-mono text-4xl font-black tracking-tight text-amber-300">
                          {vehicle.current_odometer.toLocaleString("en-US")}
                          <span className="ml-2 text-base text-slate-400">mi</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateVehicleOdometer(vehicle.id, 100)}
                          disabled={role === "operator" || isUpdating}
                          className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/15 bg-white/5 text-3xl font-black text-white transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={`/vehicles/${vehicle.id}`}
                        className="inline-flex min-h-12 items-center rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-emerald-700"
                      >
                        Open unit
                      </Link>
                      <Link
                        href={`/vehicles/${vehicle.id}/report`}
                        className="inline-flex min-h-12 items-center rounded-2xl border-2 border-slate-300 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-950 transition hover:border-slate-950 hover:bg-slate-50"
                      >
                        Compliance report
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="space-y-6">
          {role === "operator" ? (
            <div className="rounded-[40px] border-2 border-amber-200 bg-amber-50 p-8 shadow-lg">
              <div className="text-base font-bold text-amber-900">
                Tu rol actual es operador. Puedes consultar la flota, pero no cargar ni editar unidades.
              </div>
            </div>
          ) : null}

          {companyId ? (
            <VehicleForm companyId={companyId} canEdit={role !== "operator"} />
          ) : (
            <div className="rounded-[40px] border-2 border-slate-300 bg-white p-8 shadow-lg">
              <div className="text-center text-base font-bold text-slate-800">
                La empresa aun no esta lista para recibir unidades.
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
