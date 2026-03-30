"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function OnboardingForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("United States");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: companyName,
          country,
          created_by: session.user.id,
        })
        .select("id")
        .single();

      if (companyError) {
        throw companyError;
      }

      const { error: memberError } = await supabase.from("company_members").insert({
        company_id: company.id,
        profile_id: session.user.id,
        role: "owner",
      });

      if (memberError) {
        throw memberError;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (submissionError) {
      const detail =
        typeof submissionError === "object" &&
        submissionError !== null &&
        "message" in submissionError
          ? String(submissionError.message)
          : "No se pudo crear la empresa.";

      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Nombre de la empresa
        </span>
        <input
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
          placeholder="Transportes del Norte"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Pais
        </span>
        <input
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
          required
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Creando empresa..." : "Crear empresa"}
      </button>
    </form>
  );
}
