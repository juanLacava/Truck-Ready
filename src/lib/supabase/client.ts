import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getMissingEnvVars } from "@/lib/env";

let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  const missingEnvVars = getMissingEnvVars();

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing Supabase env vars: ${missingEnvVars.join(", ")}`
    );
  }

  if (!browserClient) {
    browserClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return browserClient;
}
