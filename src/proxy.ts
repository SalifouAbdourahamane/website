import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { LANG_COOKIE, countryFrom, pickLang } from "@/i18n/config";
import { hasSupabase, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/* Language routing for the Lab site (Next 16 Proxy, formerly Middleware).
   - /fr/...           French, served as is.
   - /en/...           redirected to the plain URL, which is English's public address.
   - anything else     a visitor whose choice, country or browser points to French is redirected to /fr/...;
                       everyone else is served English (rewritten internally to /en/...).
   The country comes from the host's geolocation header (Vercel, Cloudflare, AWS, Netlify, Fastly).
   Nothing is stored: no IP address, no third-party lookup. In development, ?country=NE simulates a country. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Account pages need a fresh Supabase session; server components cannot write the refreshed cookies.
  const account = /^\/(?:fr\/)?(?:account|login)(?:\/|$)/.test(pathname) && hasSupabase();
  if (!account) return route(request);

  const pending: { name: string; value: string; options: CookieOptions }[] = [];
  const noStore: Record<string, string> = {};
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));   // visible to this request's page
        pending.push(...list);
        Object.assign(noStore, headers);
      },
    },
  });
  await supabase.auth.getUser();          // refreshes an expired access token, if any
  const res = route(request);
  pending.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
  Object.entries(noStore).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

function route(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const forward = { request: { headers: request.headers } };

  if (pathname === "/fr" || pathname.startsWith("/fr/")) return NextResponse.next(forward);

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en/, "") || "/";
    return NextResponse.redirect(url, 308);
  }

  const simulated = process.env.NODE_ENV !== "production" ? searchParams.get("country") : null;
  const lang = pickLang({
    cookie: request.cookies.get(LANG_COOKIE)?.value,
    country: simulated?.toUpperCase() ?? countryFrom(request.headers),
    acceptLanguage: request.headers.get("accept-language"),
  });

  if (lang === "fr") {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/fr" : `/fr${pathname}`;
    url.searchParams.delete("country");
    const res = NextResponse.redirect(url, 307);       // temporary: the answer depends on the visitor
    res.headers.set("Vary", "Accept-Language, Cookie");
    return res;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.rewrite(url, forward);
  res.headers.set("Vary", "Accept-Language, Cookie");
  return res;
}

export const config = {
  // Every page path; not Next's own assets, API routes or files with an extension (fonts, images, robots.txt).
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
