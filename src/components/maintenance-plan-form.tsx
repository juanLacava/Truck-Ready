"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type VehicleOption = {
  id: string;
  internal_code: string | null;
  plate: string;
  brand: string | null;
  model: string | null;
  current_odometer: number;
};

function addDays(baseDate: string, days: number) {
  const date = new Date(`${baseDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function MaintenancePlanForm({
  companyId,
  vehicles,
  canEdit = true,
}: {
  companyId: string;
  vehicles: VehicleOption[];
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [triggerType, setTriggerType] = useState<"date" | "odometer">("odometer");
  const [intervalDays, setIntervalDays] = useState("");
  const [intervalKm, setIntervalKm] = useState("");
  const [lastServiceDate, setLastServiceDate] = useState("");
  const [lastServiceOdometer, setLastServiceOdometer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEdit) {
      setError("Solo owners y admins pueden crear planes de mantenimiento.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();

      if (triggerType === "date" && (!intervalDays || !lastServiceDate)) {
        throw new Error("Completa la frecuencia en dias y la ultima fecha de servicio.");
      }

      if (triggerType === "odometer" && (!intervalKm || !lastServiceOdometer)) {
        throw new Error(
          "Completa la frecuencia en kilometraje y el kilometraje del ultimo servicio."
        );
      }

      const nextDueDate =
        triggerType === "date" && intervalDays && lastServiceDate
          ? addDays(lastServiceDate, Number(intervalDays))
          : null;

      const nextDueOdometer =
        triggerType === "odometer" && intervalKm && lastServiceOdometer
          ? Number(lastServiceOdometer) + Number(intervalKm)
          : null;

      const { error: insertError } = await supabase.from("maintenance_plans").insert({
        company_id: companyId,
        vehicle_id: vehicleId,
        title: title.trim(),
        trigger_type: triggerType,
        interval_days: triggerType === "date" ? Number(intervalDays) : null,
        interval_km: triggerType === "odometer" ? Number(intervalKm) : null,
        last_service_date: triggerType === "date" ? lastServiceDate : null,
        last_service_odometer:
          triggerType === "odometer" ? Number(lastServiceOdometer) : null,
        next_due_date: nextDueDate,
        next_due_odometer: nextDueOdometer,
      });

      if (insertError) {
        throw insertError;
      }

      setTitle("");
      setIntervalDays("");
      setIntervalKm("");
      setLastServiceDate("");
      setLastServiceOdometer("");
      router.refresh();
    } catch (submissionError) {
      const detail =
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo crear el plan de mantenimiento.";

      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Nuevo plan</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Primero necesitas cargar al menos una unidad para poder programar un
          mantenimiento preventivo.
        </p>
      </div>
    );
  }

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId) ?? vehicles[0];

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-[32px] border-2 border-slate-300 bg-white p-8 shadow-lg"
    >
      <h2 className="text-2xl font-black tracking-tighter text-slate-950 uppercase italic underline decoration-emerald-500 underline-offset-8">Nuevo plan</h2>

      <div className="mt-4 grid gap-5">
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">Unidad</span>
          <select
            value={vehicleId}
            onChange={(event) => setVehicleId(event.target.value)}
            className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
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
          <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">Plan</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
            placeholder="Cambio de aceite, frenos, alineacion..."
            required
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">Regla</span>
            <select
              value={triggerType}
              onChange={(event) =>
                setTriggerType(event.target.value as "date" | "odometer")
              }
              className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
            >
              <option value="odometer">Por kilometraje</option>
              <option value="date">Por fecha</option>
            </select>
          </label>

          <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-900">
            <div className="text-[10px] uppercase tracking-widest opacity-70">Kilometraje actual</div>
            <div className="text-lg">
              {selectedVehicle.current_odometer.toLocaleString("en-US")} mi
            </div>
          </div>

          {triggerType === "date" ? (
            <>
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
                  Cada cuantos dias
                </span>
                <input
                  type="number"
                  min="1"
                  value={intervalDays}
                  onChange={(event) => setIntervalDays(event.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                  placeholder="90"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
                  Ultimo servicio
                </span>
                <input
                  type="date"
                  value={lastServiceDate}
                  onChange={(event) => setLastServiceDate(event.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                />
              </label>
            </>
          ) : (
            <>
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
                  Cada cuantos km
                </span>
                <input
                  type="number"
                  min="1"
                  value={intervalKm}
                  onChange={(event) => setIntervalKm(event.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                  placeholder="10000"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
                  Ultimo servicio en km
                </span>
                <input
                  type="number"
                  min="0"
                  value={lastServiceOdometer}
                  onChange={(event) => setLastServiceOdometer(event.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                  placeholder={String(selectedVehicle.current_odometer)}
                />
              </label>
            </>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
          {error}
        </div>
      ) : null}

      {!canEdit ? (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
          Este formulario esta bloqueado para operadores.
        </div>
      ) : null}

      <div className="mt-4">
        <button
          type="submit"
          disabled={isSubmitting || !canEdit}
          className="w-full rounded-xl bg-slate-950 px-8 py-4 text-base font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
        >
          {isSubmitting ? "Guardando..." : "Guardar plan"}
        </button>
      </div>
    </form>
  );
}
