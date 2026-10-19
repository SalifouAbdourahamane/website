import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasSupabase } from "@/lib/supabase/env";
import { fail, sameOrigin } from "@/lib/http";

/* Beta review: an admin approves or denies an account, and can change its monthly audio allowance.
   The admin check reads the caller's own profile with the service role, so it cannot be spoofed from the browser. */
export async function POST(req: NextRequest) {
  if (!hasSupabase()) return fail(503, "not_configured", "Accounts are not configured.");
  if (!sameOrigin(req)) return fail(403, "bad_origin", "Cross-site request refused.");
  const { user } = await currentUser();
  if (!user) return fail(401, "signed_out", "Sign in first.");
  const admin = supabaseAdmin();
  const { data: me } = await admin.from("profiles").select("role").eq("user_id", user.id).single();
  if (me?.role !== "admin") return fail(403, "not_admin", "Admins only.");

  const body = await req.json().catch(() => null) as { user_id?: unknown; status?: unknown; minutes?: unknown } | null;
  const target = typeof body?.user_id === "string" && /^[0-9a-f-]{36}$/i.test(body.user_id) ? body.user_id : null;
  const status = body?.status === "approved" || body?.status === "denied" ? body.status : null;
  if (!target || !status) return fail(400, "bad_request", "user_id and status (approved|denied) are required.");
  if (target === user.id && status === "denied") return fail(400, "self", "You cannot deny your own account.");
  const patch: Record<string, unknown> = { beta_status: status, reviewed_at: new Date().toISOString() };
  if (typeof body?.minutes === "number" && Number.isFinite(body.minutes) && body.minutes >= 0 && body.minutes <= 100000)
    patch.monthly_audio_seconds = Math.round(body.minutes * 60);

  const { data, error } = await admin.from("profiles").update(patch).eq("user_id", target)
    .select("user_id, email, beta_status, use_case, monthly_audio_seconds, created_at").single();
  if (error) return fail(500, "db_error", "Could not update the account.");
  return NextResponse.json({ data });
}
