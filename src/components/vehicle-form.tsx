"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function VehicleForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [internalCode, setInternalCode] = useState("");
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [currentOdometer, setCurrentOdometer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const { error: insertError } = await supabase.from("vehicles").insert({
        company_id: companyId,
        internal_code: internalCode || null,
        plate,
        brand: brand || null,
        model: model || null,
        year: year ? Number(year) : null,
        current_odometer: currentOdometer ? Number(currentOdometer) : 0,
      });

      if (insertError) {
        throw insertError;
      }

      setInternalCode("");
      setPlate("");
      setBrand("");
      setModel("");
      setYear("");
      setCurrentOdometer("");
      router.refresh();
    } catch (submissionError) {
      const detail =
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo crear la unidad.";

      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Nueva unidad</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Codigo interno
          </span>
          <input
            value={internalCode}
            onChange={(event) => setInternalCode(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
            placeholder="TR-014"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Placa
          </span>
          <input
            value={plate}
            onChange={(event) => setPlate(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
            placeholder="ABC1234"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Marca
          </span>
          <input
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
            placeholder="Ford"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Modelo
          </span>
          <input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
            placeholder="Transit"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Anio
          </span>
          <input
            type="number"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
            placeholder="2022"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Kilometraje actual
          </span>
          <input
            type="number"
            value={currentOdometer}
            onChange={(event) => setCurrentOdometer(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
            placeholder="85000"
          />
        </label>
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
        {isSubmitting ? "Guardando..." : "Guardar unidad"}
      </button>
    </form>
  );
}
