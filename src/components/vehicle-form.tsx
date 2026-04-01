"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function VehicleForm({
  companyId,
  canEdit = true,
}: {
  companyId: string;
  canEdit?: boolean;
}) {
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

    if (!canEdit) {
      setError("Solo owners y admins pueden cargar unidades.");
      return;
    }

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
    <form onSubmit={handleSubmit} className="grid gap-6 rounded-[32px] border-2 border-slate-300 bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-black tracking-tighter text-slate-950 uppercase italic underline decoration-emerald-500 underline-offset-8">Nueva unidad</h2>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
            Codigo interno
          </span>
          <input
            value={internalCode}
            onChange={(event) => setInternalCode(event.target.value)}
            className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
            placeholder="TR-014"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
            Placa
          </span>
          <input
            value={plate}
            onChange={(event) => setPlate(event.target.value)}
            className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
            placeholder="ABC1234"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
            Marca
          </span>
          <input
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
            placeholder="Ford"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
            Modelo
          </span>
          <input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
            placeholder="Transit"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
            Anio
          </span>
          <input
            type="number"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
            placeholder="2022"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600">
            Kilometraje actual (mi)
          </span>
          <input
            type="number"
            value={currentOdometer}
            onChange={(event) => setCurrentOdometer(event.target.value)}
            className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
            placeholder="85000"
          />
        </label>
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
          {isSubmitting ? "Guardando..." : "Guardar unidad"}
        </button>
      </div>
    </form>
  );
}
