"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type VehicleOption = {
  id: string;
  internal_code: string | null;
  plate: string;
};

const languageOptions = [
  { value: "es", label: "Espanol" },
  { value: "en", label: "Ingles" },
  { value: "bilingual", label: "Bilingue" },
];

export function DocumentForm({
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
  const [documentType, setDocumentType] = useState("");
  const [language, setLanguage] = useState<"es" | "en" | "bilingual">("bilingual");
  const [expiresAt, setExpiresAt] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEdit) {
      setError("Solo owners y admins pueden cargar documentos.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const { error: insertError } = await supabase.from("vehicle_documents").insert({
        company_id: companyId,
        vehicle_id: vehicleId,
        title: title.trim(),
        document_type: documentType.trim() || "custom",
        language,
        expires_at: expiresAt || null,
        file_url: fileUrl.trim() || null,
        notes: notes.trim() || null,
      });

      if (insertError) {
        throw insertError;
      }

      setTitle("");
      setDocumentType("");
      setLanguage("bilingual");
      setExpiresAt("");
      setFileUrl("");
      setNotes("");
      router.refresh();
    } catch (submissionError) {
      const detail =
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo guardar el documento.";

      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Nuevo documento</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Primero necesitas cargar al menos una unidad para asociarle documentos.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Nuevo documento</h2>

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

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">Titulo</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
            placeholder="CDL, poliza, inspeccion anual..."
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Tipo de documento
          </span>
          <input
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
            placeholder="license, insurance, inspection..."
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Idioma</span>
          <select
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value as "es" | "en" | "bilingual")
            }
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Vence el
          </span>
          <input
            type="date"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            URL o referencia
          </span>
          <input
            value={fileUrl}
            onChange={(event) => setFileUrl(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
            placeholder="https://... o nombre del archivo"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">Notas</span>
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
            placeholder="Referencia, ubicacion, observaciones..."
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {!canEdit ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Este formulario esta bloqueado para operadores.
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !canEdit}
        className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
      >
        {isSubmitting ? "Guardando..." : "Guardar documento"}
      </button>
    </form>
  );
}
