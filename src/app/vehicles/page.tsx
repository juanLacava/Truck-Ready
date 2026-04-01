"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function VehiclesPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [role, setRole] = useState<VehicleMembership["role"] | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          .select(
            "id, internal_code, plate, brand, model, year, current_odometer, status"
          )
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
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar las unidades.";

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

  return (
    <DashboardLayout
      title="Unidades"
      description="Modulo de administracion de flota. Aqui puedes cargar nuevas unidades y gestionar el estado operativo de cada vehiculo."
    >
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-3xl border-2 border-slate-300 bg-white shadow-xl">
          <table className="min-w-full divide-y-2 divide-slate-300 text-sm">
            <thead className="bg-slate-50 text-left text-slate-950 uppercase tracking-widest text-[10px] font-black">
              <tr>
                <th className="px-5 py-4">Codigo</th>
                <th className="px-5 py-4">Placa</th>
                <th className="px-5 py-4">Vehiculo</th>
                <th className="px-5 py-4">Odometer</th>
                <th className="px-5 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-800 font-bold">
                    Cargando flota...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-rose-700 font-bold italic">
                    {error}
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-600 font-bold">
                    Aun no hay unidades cargadas.
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-5 text-slate-950 font-black">
                      <Link
                        href={`/vehicles/${vehicle.id}`}
                        className="underline decoration-slate-300 underline-offset-4 hover:decoration-emerald-500"
                      >
                        {vehicle.internal_code ?? "-"}
                      </Link>
                    </td>
                    <td className="px-5 py-5 text-slate-950 font-black tracking-tight">
                      <Link href={`/vehicles/${vehicle.id}`} className="hover:text-emerald-700">
                        {vehicle.plate}
                      </Link>
                    </td>
                    <td className="px-5 py-5 text-slate-800 font-bold">
                      {[vehicle.brand, vehicle.model, vehicle.year]
                        .filter(Boolean)
                        .join(" ") || "-"}
                    </td>
                    <td className="px-5 py-5 text-slate-950 font-black">
                      {vehicle.current_odometer.toLocaleString("en-US")} mi
                    </td>
                    <td className="px-5 py-5">
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wider border-2 ${
                        vehicle.status === 'active' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-slate-100 border-slate-400 text-slate-700'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
            <div className="text-base font-bold text-slate-800 text-center">
              La empresa aun no esta lista para recibir unidades.
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
