import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasSupabase } from "@/lib/supabase/env";
import { KEY_COLUMNS as COLUMNS, MAX_ACTIVE_KEYS, displayPrefix, generateKey, hashKey, isScopeList } from "@/lib/keys";
import { fail, sameOrigin } from "@/lib/http";

/* The dashboard's key operations. Keys are minted here, on the server: the browser sees the secret once,
   in this response, and the database only ever sees its HMAC. */
export const dynamic = "force-dynamic";


async function signedIn(req: NextRequest, write: boolean) {
  if (!hasSupabase()) return { e: fail(503, "not_configured", "Accounts are not configured.") } as const;
  if (write && !sameOrigin(req)) return { e: fail(403, "bad_origin", "Cross-site request refused.") } as const;
  const { supabase, user } = await currentUser();
  if (!user) return { e: fail(401, "signed_out", "Sign in first.") } as const;
  return { e: null, supabase, user } as const;
}

export async function GET(req: NextRequest) {
  const s = await signedIn(req, false);
  if (s.e) return s.e;
  const { data, error } = await s.supabase.from("api_keys").select(COLUMNS).order("created_at", { ascending: false });
  if (error) return fail(500, "db_error", "Could not load keys.");
  return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const s = await signedIn(req, true);
  if (s.e) return s.e;
  const body = await req.json().catch(() => null) as { name?: unknown; scopes?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 60) : "";
  if (!name) return fail(400, "missing_name", "Give the key a name.");
  if (!isScopeList(body?.scopes)) return fail(400, "bad_scopes", "Pick at least one model.");
  const scopes = [...new Set(body.scopes)];

  const admin = supabaseAdmin();
  const { data: profile } = await admin.from("profiles").select("beta_status").eq("user_id", s.user.id).single();
  if (profile?.beta_status !== "approved") return fail(403, "beta_pending", "Your account is waiting for beta approval.");
  const { count } = await admin.from("api_keys").select("id", { count: "exact", head: true })
    .eq("user_id", s.user.id).is("revoked_at", null);
  if ((count ?? 0) >= MAX_ACTIVE_KEYS) return fail(409, "too_many_keys", `Revoke a key first: ${MAX_ACTIVE_KEYS} active keys at most.`);

  const key = generateKey();
  const { data, error } = await admin.from("api_keys")
    .insert({ user_id: s.user.id, name, prefix: displayPrefix(key), key_hash: hashKey(key), scopes })
    .select(COLUMNS).single();
  if (error) return fail(500, "db_error", "Could not create the key.");
  return NextResponse.json({ key, data }, { status: 201, headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(req: NextRequest) {
  const s = await signedIn(req, true);
  if (s.e) return s.e;
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return fail(400, "bad_id", "Unknown key.");
  // Scoped to the caller: one account can never revoke another's key, even with its id.
  const { data, error } = await supabaseAdmin().from("api_keys").update({ revoked_at: new Date().toISOString() })
    .eq("id", id).eq("user_id", s.user.id).is("revoked_at", null).select(COLUMNS);
  if (error) return fail(500, "db_error", "Could not revoke the key.");
  if (!data?.length) return fail(404, "not_found", "Unknown key.");
  return NextResponse.json({ data: data[0] }, { headers: { "Cache-Control": "no-store" } });
}
