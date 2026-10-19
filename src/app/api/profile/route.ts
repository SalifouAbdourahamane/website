import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasSupabase } from "@/lib/supabase/env";
import { fail, sameOrigin } from "@/lib/http";

/* A pending developer tells us what they are building. That is the only field a user can change. */
export async function POST(req: NextRequest) {
  if (!hasSupabase()) return fail(503, "not_configured", "Accounts are not configured.");
  if (!sameOrigin(req)) return fail(403, "bad_origin", "Cross-site request refused.");
  const { user } = await currentUser();
  if (!user) return fail(401, "signed_out", "Sign in first.");
  const body = await req.json().catch(() => null) as { use_case?: unknown } | null;
  const useCase = typeof body?.use_case === "string" ? body.use_case.trim().slice(0, 1000) : "";
  if (!useCase) return fail(400, "missing_use_case", "Tell us a little about your project.");
  const { error } = await supabaseAdmin().from("profiles").update({ use_case: useCase }).eq("user_id", user.id);
  if (error) return fail(500, "db_error", "Could not save.");
  return NextResponse.json({ ok: true });
}
