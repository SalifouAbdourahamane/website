import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, countryFrom, pickLang } from "@/i18n/config";

/* Language routing for the Lab site (Next 16 Proxy, formerly Middleware).
   - /fr/...           French, served as is.
   - /en/...           redirected to the plain URL, which is English's public address.
   - anything else     a visitor whose choice, country or browser points to French is redirected to /fr/...;
                       everyone else is served English (rewritten internally to /en/...).
   The country comes from the host's geolocation header (Vercel, Cloudflare, AWS, Netlify, Fastly).
   Nothing is stored: no IP address, no third-party lookup. In development, ?country=NE simulates a country. */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/fr" || pathname.startsWith("/fr/")) return NextResponse.next();

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
  const res = NextResponse.rewrite(url);
  res.headers.set("Vary", "Accept-Language, Cookie");
  return res;
}

export const config = {
  // Every page path; not Next's own assets, API routes or files with an extension (fonts, images, robots.txt).
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
