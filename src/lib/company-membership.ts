import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const ACTIVE_COMPANY_STORAGE_KEY = "truck-ready.active-company-id";

type MembershipWithCompany = {
  company_id: string;
  created_at: string;
};

export async function getMemberships<T extends MembershipWithCompany>(
  supabase: SupabaseClient<Database>,
  userId: string,
  select: string
) {
  const { data, error } = await supabase
    .from("company_members")
    .select(select)
    .eq("profile_id", userId)
    .order("created_at", { ascending: true })
    .returns<T[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getActiveMembership<T extends MembershipWithCompany>(
  supabase: SupabaseClient<Database>,
  userId: string,
  select: string
) {
  const memberships = await getMemberships<T>(supabase, userId, select);

  if (memberships.length === 0) {
    return null;
  }

  const savedCompanyId =
    typeof window === "undefined" ? null : window.localStorage.getItem(ACTIVE_COMPANY_STORAGE_KEY);
  const activeMembership =
    memberships.find((membership) => membership.company_id === savedCompanyId) ?? memberships[0];

  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACTIVE_COMPANY_STORAGE_KEY, activeMembership.company_id);
  }

  return activeMembership;
}

export function setActiveCompanyId(companyId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACTIVE_COMPANY_STORAGE_KEY, companyId);
}
