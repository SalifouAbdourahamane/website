import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/* Where the magic link and OAuth providers send the visitor back: swap the one-time code for a session. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") ?? "/account/keys";
  // Only same-site paths: never let the link bounce a fresh session to another origin.
  const safe = /^\/(?!\/)[\w\-/]*$/.test(next) ? next : "/account/keys";
  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safe, req.url), 303);
  }
  const back = new URL(safe.startsWith("/fr") ? "/fr/login" : "/login", req.url);
  back.searchParams.set("error", "link");
  return NextResponse.redirect(back, 303);
}
