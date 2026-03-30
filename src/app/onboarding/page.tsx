"use client";

import { OnboardingForm } from "@/components/onboarding-form";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_20px_80px_rgba(48,57,37,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Configura tu empresa
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Este es el primer paso real del producto. Crea tu empresa para poder
          registrar unidades, vencimientos y mantenimientos.
        </p>

        <div className="mt-8">
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}
