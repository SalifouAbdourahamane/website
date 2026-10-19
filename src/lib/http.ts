import { NextResponse, type NextRequest } from "next/server";

/* Shared bits for the site's route handlers. Errors use the gateway's shape: { error: { type, message } }. */
export const fail = (status: number, type: string, message: string, headers?: HeadersInit) =>
  NextResponse.json({ error: { type, message } }, { status, headers: { "Cache-Control": "no-store", ...headers } });

/** Requests that change state must come from this site's own pages (defence in depth over SameSite cookies). */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).host === req.headers.get("host"); } catch { return false; }
}

/** The visitor's IP as seen by the hosting edge (Vercel sets x-forwarded-for; the first entry is the client). */
export const clientIp = (req: NextRequest) =>
  req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
