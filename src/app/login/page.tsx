"use client";

import { AuthCard } from "@/components/auth-card";
import { AuthForm } from "@/components/auth-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <AuthCard
        title="Ingresar"
        description="Acceso para empresas que ya usan Truck Ready."
      >
        <AuthForm mode="login" />
      </AuthCard>
    </main>
  );
}
