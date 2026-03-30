import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getMissingEnvVars } from "@/lib/env";

export function getSupabaseServerClient() {
  const missingEnvVars = getMissingEnvVars();

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing Supabase env vars: ${missingEnvVars.join(", ")}`
    );
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
