import { redirect } from "next/navigation";
import { lp, type Lang } from "@/i18n/config";
import { currentUser } from "@/lib/supabase/server";

export type Profile = {
  user_id: string; email: string | null; beta_status: "pending" | "approved" | "denied"; role: "user" | "admin";
  use_case: string | null; monthly_audio_seconds: number; created_at: string;
};

/* Every account page starts here: a verified user and their profile, or a trip to the sign-in page. */
export async function requireAccount(lang: Lang, path: string) {
  const { supabase, user } = await currentUser();
  if (!user) redirect(`${lp(lang, "/login")}?next=${encodeURIComponent(lp(lang, path))}`);
  const { data } = await supabase.from("profiles")
    .select("user_id, email, beta_status, role, use_case, monthly_audio_seconds, created_at")
    .eq("user_id", user.id).single();
  // The signup trigger creates the profile; until it exists, treat the account as pending.
  const profile: Profile = (data as Profile | null) ?? {
    user_id: user.id, email: user.email ?? null, beta_status: "pending", role: "user", use_case: null,
    monthly_audio_seconds: 0, created_at: new Date().toISOString(),
  };
  return { supabase, user, profile };
}

export const fmtDate = (lang: Lang, iso: string | null) =>
  iso ? new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)) : null;
