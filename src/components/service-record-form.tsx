"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type VehicleOption = {
  id: string;
  internal_code: string | null;
  plate: string;
  brand: string | null;
  model: string | null;
  current_odometer: number;
};

type MaintenancePlanOption = {
  id: string;
  vehicle_id: string;
  title: string;
  trigger_type: "date" | "odometer";
  interval_days: number | null;
  interval_km: number | null;
};

function addDays(baseDate: string, days: number) {
  const date = new Date(`${baseDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function ServiceRecordForm({
  companyId,
  vehicles,
  plans,
}: {
  companyId: string;
  vehicles: VehicleOption[];
  plans: MaintenancePlanOption[];
}) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [maintenancePlanId, setMaintenancePlanId] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [odometer, setOdometer] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availablePlans = plans.filter((plan) => plan.vehicle_id === vehicleId);
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId) ?? vehicles[0];
  const selectedPlan =
    availablePlans.find((plan) => plan.id === maintenancePlanId) ?? null;

  useEffect(() => {
    if (!availablePlans.some((plan) => plan.id === maintenancePlanId)) {
      setMaintenancePlanId("");
    }
  }, [availablePlans, maintenancePlanId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();

      if (!serviceType.trim()) {
        throw new Error("Indica el tipo de servicio realizado.");
      }

      const normalizedOdometer = odometer ? Number(odometer) : null;
      const normalizedCost = cost ? Number(cost) : null;

      const { error: insertError } = await supabase.from("service_records").insert({
        company_id: companyId,
        vehicle_id: vehicleId,
        maintenance_plan_id: maintenancePlanId || null,
        service_date: serviceDate,
        odometer: normalizedOdometer,
        service_type: serviceType.trim(),
        cost: normalizedCost,
        notes: notes.trim() || null,
      });

      if (insertError) {
        throw insertError;
      }

      if (
        normalizedOdometer !== null &&
        selectedVehicle &&
        normalizedOdometer > selectedVehicle.current_odometer
      ) {
        const { error: vehicleUpdateError } = await supabase
          .from("vehicles")
          .update({ current_odometer: normalizedOdometer })
          .eq("id", selectedVehicle.id)
          .eq("company_id", companyId);

        if (vehicleUpdateError) {
          throw vehicleUpdateError;
        }
      }

      if (selectedPlan) {
        const updatePayload =
          selectedPlan.trigger_type === "date"
            ? {
                last_service_date: serviceDate,
                next_due_date:
                  selectedPlan.interval_days !== null
                    ? addDays(serviceDate, selectedPlan.interval_days)
                    : null,
              }
            : {
                last_service_odometer: normalizedOdometer,
                next_due_odometer:
                  normalizedOdometer !== null && selectedPlan.interval_km !== null
                    ? normalizedOdometer + selectedPlan.interval_km
                    : null,
              };

        const { error: planUpdateError } = await supabase
          .from("maintenance_plans")
          .update(updatePayload)
          .eq("id", selectedPlan.id)
          .eq("company_id", companyId);

        if (planUpdateError) {
          throw planUpdateError;
        }
      }

      setServiceDate("");
      setOdometer("");
      setServiceType("");
      setCost("");
      setNotes("");
      router.refresh();
    } catch (submissionError) {
      const detail =
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo registrar el servicio.";

      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Nuevo servicio</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Primero necesitas cargar al menos una unidad para registrar servicios.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Nuevo servicio</h2>

      <div className="grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Unidad</span>
          <select
            value={vehicleId}
            onChange={(event) => setVehicleId(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
            required
          >
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.internal_code || vehicle.plate}
                {vehicle.internal_code ? ` · ${vehicle.plate}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Plan relacionado
          </span>
          <select
            value={maintenancePlanId}
            onChange={(event) => {
              const nextPlanId = event.target.value;
              setMaintenancePlanId(nextPlanId);

              const nextPlan = availablePlans.find((plan) => plan.id === nextPlanId);
              if (nextPlan && !serviceType.trim()) {
                setServiceType(nextPlan.title);
              }
            }}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
          >
            <option value="">Sin vincular a un plan</option>
            {availablePlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.title}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Fecha del servicio
            </span>
            <input
              type="date"
              value={serviceDate}
              onChange={(event) => setServiceDate(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Kilometraje
            </span>
            <input
              type="number"
              min="0"
              value={odometer}
              onChange={(event) => setOdometer(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
              placeholder={String(selectedVehicle.current_odometer)}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Tipo de servicio
            </span>
            <input
              value={serviceType}
              onChange={(event) => setServiceType(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
              placeholder="Cambio de aceite, frenos, alineacion..."
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Costo</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
              placeholder="120.00"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Notas</span>
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
              placeholder="Taller, proveedor, observaciones..."
            />
          </label>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
      >
        {isSubmitting ? "Guardando..." : "Guardar servicio"}
      </button>
    </form>
  );
}
