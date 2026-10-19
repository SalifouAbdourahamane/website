import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

/* Supabase with the service role: bypasses row-level security. Server-only, and only after the route
   has checked who is asking. Never import this from a client component. */
export function supabaseAdmin() {
  if (typeof window !== "undefined") throw new Error("supabaseAdmin is server-only");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) throw new Error("Supabase service role is not configured");
  return createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
