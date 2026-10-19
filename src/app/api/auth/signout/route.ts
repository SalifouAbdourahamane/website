import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/http";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return new NextResponse(null, { status: 403 });
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  const fr = (req.headers.get("referer") ?? "").includes("/fr/");
  return NextResponse.redirect(new URL(fr ? "/fr" : "/", req.url), 303);
}
