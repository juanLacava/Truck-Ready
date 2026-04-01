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
};

const expirationTypes = [
  { value: "insurance", label: "Seguro" },
  { value: "inspection", label: "Inspeccion" },
  { value: "registration", label: "Registro" },
  { value: "license", label: "Licencia" },
  { value: "permit", label: "Permiso" },
  { value: "custom", label: "Personalizado" },
];

export function ExpirationForm({
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
  const [type, setType] = useState(expirationTypes[0]?.value ?? "insurance");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [alertDaysBefore, setAlertDaysBefore] = useState("15");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEdit) {
      setError("Solo owners y admins pueden crear vencimientos.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const normalizedTitle =
        title.trim() || expirationTypes.find((item) => item.value === type)?.label || "Vencimiento";

      const { error: insertError } = await supabase.from("expiration_items").insert({
        company_id: companyId,
        vehicle_id: vehicleId,
        type,
        title: normalizedTitle,
        due_date: dueDate,
        alert_days_before: alertDaysBefore ? Number(alertDaysBefore) : 15,
        notes: notes.trim() || null,
      });

      if (insertError) {
        throw insertError;
      }

      setTitle("");
      setDueDate("");
      setAlertDaysBefore("15");
      setNotes("");
      router.refresh();
    } catch (submissionError) {
      const detail =
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo crear el vencimiento.";

      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Nuevo vencimiento</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Primero necesitas cargar al menos una unidad para asociarle documentos o
          obligaciones con fecha.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-[32px] border-2 border-slate-300 bg-white p-8 shadow-lg"
    >
      <h2 className="text-2xl font-black tracking-tighter text-slate-950 uppercase italic underline decoration-emerald-500 underline-offset-8">Nuevo vencimiento</h2>

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

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">Tipo</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
              required
            >
              {expirationTypes.map((expirationType) => (
                <option key={expirationType.value} value={expirationType.value}>
                  {expirationType.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
              Vence el
            </span>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
              required
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
              Titulo visible
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
              placeholder="Seguro comercial, DOT anual, etc."
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
              Avisar antes (dias)
            </span>
            <input
              type="number"
              min="0"
              value={alertDaysBefore}
              onChange={(event) => setAlertDaysBefore(event.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
              placeholder="15"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">Notas</span>
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
              placeholder="Referencia o detalles..."
            />
          </label>
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
          {isSubmitting ? "Guardando..." : "Guardar vencimiento"}
        </button>
      </div>
    </form>
  );
}
