"use client";

import { AuthCard } from "@/components/auth-card";
import { AuthForm } from "@/components/auth-form";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <AuthCard
        title="Crear cuenta"
        description="Crea tu acceso inicial para empezar a configurar tu empresa y tus unidades."
      >
        <AuthForm mode="register" />
      </AuthCard>
    </main>
  );
}
