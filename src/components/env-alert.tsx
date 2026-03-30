import Link from "next/link";
import { getMissingEnvVars } from "@/lib/env";

export function EnvAlert() {
  const missingEnvVars = getMissingEnvVars();

  if (missingEnvVars.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
      <div className="font-semibold">Configuracion pendiente</div>
      <p className="mt-2 leading-6">
        Antes de conectar autenticacion y datos reales, hace falta completar
        las variables de entorno de Supabase en <code>.env.local</code>.
      </p>
      <p className="mt-2">
        Variables faltantes: {missingEnvVars.join(", ")}
      </p>
      <Link href="/login" className="mt-4 inline-flex font-medium underline">
        Ver pantallas de acceso
      </Link>
    </div>
  );
}
