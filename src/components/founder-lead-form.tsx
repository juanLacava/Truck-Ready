"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const concernOptions = [
  { value: "dot", label: "DOT e inspecciones" },
  { value: "insurance", label: "Seguros" },
  { value: "expirations", label: "Vencimientos" },
  { value: "maintenance", label: "Mantenimiento" },
];

function normalizeFleetSize(value: string) {
  if (value === "1") return 1;
  if (value === "2-5") return 5;
  if (value === "6-10") return 10;
  if (value === "+10") return 11;
  return null;
}

export function FounderLeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fleetSize, setFleetSize] = useState("");
  const [primaryConcern, setPrimaryConcern] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const { error: insertError } = await supabase.from("founder_leads").insert({
        full_name: name.trim(),
        phone: phone.trim(),
        fleet_size: normalizeFleetSize(fleetSize),
        primary_concern: primaryConcern || null,
      });

      if (insertError) {
        throw insertError;
      }

      setName("");
      setPhone("");
      setFleetSize("");
      setPrimaryConcern("");
      setSuccess(
        "Recibido. Te vamos a contactar por WhatsApp para evaluar si encajas en Operadores Fundadores."
      );
    } catch (submissionError) {
      const detail =
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo enviar tu solicitud.";

      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.05)]"
    >
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Operadores Fundadores
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
          Aplica a la beta
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Queremos hablar con transportistas reales. Completa esto y te
          contactamos por WhatsApp si encajas para la oferta de lanzamiento.
        </p>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Nombre</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
          placeholder="Juan Perez"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          WhatsApp
        </span>
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
          placeholder="+1 305 555 0149"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Cuantos camiones manejas
        </span>
        <select
          value={fleetSize}
          onChange={(event) => setFleetSize(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
        >
          <option value="">Selecciona una opcion</option>
          <option value="1">1</option>
          <option value="2-5">2-5</option>
          <option value="6-10">6-10</option>
          <option value="+10">+10</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Que te preocupa mas hoy
        </span>
        <select
          value={primaryConcern}
          onChange={(event) => setPrimaryConcern(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
        >
          <option value="">Selecciona una opcion</option>
          {concernOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,185,129,0.28)] transition hover:bg-[#0ea271] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Enviando..." : "Ser Operador Fundador (-70%)"}
      </button>

      <p className="text-xs leading-5 text-slate-500">
        Si quedas seleccionado, te contactamos por WhatsApp para una breve llamada
        y acceso anticipado.
      </p>
    </form>
  );
}
