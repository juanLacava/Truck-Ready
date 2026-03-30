"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { VehicleForm } from "@/components/vehicle-form";
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
};

export default function VehiclesPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
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

        const { data: membership, error: membershipError } = await supabase
          .from("company_members")
          .select("company_id")
          .eq("profile_id", session.user.id)
          .limit(1)
          .returns<VehicleMembership[]>()
          .maybeSingle();

        if (membershipError) {
          throw membershipError;
        }

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
      description="Modulo inicial conectado a Supabase para administrar las unidades de cada empresa."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Codigo</th>
                <th className="px-4 py-3 font-medium">Placa</th>
                <th className="px-4 py-3 font-medium">Vehiculo</th>
                <th className="px-4 py-3 font-medium">Kilometraje</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Cargando unidades...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-rose-700">
                    {error}
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Aun no hay unidades cargadas.
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="px-4 py-3 text-slate-900">
                      {vehicle.internal_code ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{vehicle.plate}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {[vehicle.brand, vehicle.model, vehicle.year]
                        .filter(Boolean)
                        .join(" ") || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {vehicle.current_odometer.toLocaleString("en-US")} mi
                    </td>
                    <td className="px-4 py-3 text-slate-700">{vehicle.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {companyId ? (
          <VehicleForm companyId={companyId} />
        ) : (
          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-500">
              La empresa aun no esta lista para cargar unidades.
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
