/* Languages of the Lab site. English lives at the plain URLs (/research), French under /fr (/fr/research).
   Internally both are served from app/[lang]; src/proxy.ts maps the public URLs onto it. */

export const locales = ["en", "fr"] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = "en";
export const isLang = (s: string): s is Lang => (locales as readonly string[]).includes(s);

/** The cookie that remembers a visitor's explicit choice from the EN · FR switch. */
export const LANG_COOKIE = "lab-lang";

/* Countries where French is the main language of public life, administration or schooling.
   Visitors from these countries see French first. */
export const FRENCH_COUNTRIES = new Set([
  // West and Central Africa
  "NE", "SN", "ML", "BF", "CI", "BJ", "TG", "GN", "CM", "TD", "CF", "GA", "CG", "CD", "DJ", "KM", "MG", "BI", "MR",
  // North Africa, where French is the common second language of science and business
  "DZ", "MA", "TN",
  // Europe, the Americas and the Indian Ocean
  "FR", "MC", "LU", "HT", "RE", "GP", "MQ", "GF", "YT", "PM", "NC", "PF", "WF", "BL", "MF", "SC",
]);

/* Countries with English and French in everyday use: here the browser's language decides. */
export const BILINGUAL_COUNTRIES = new Set(["CA", "BE", "CH", "RW", "VU", "MU"]);

/** The country of the request, from whichever host header is present (Vercel, Cloudflare, AWS, Netlify, Fastly). */
export function countryFrom(h: Headers): string | null {
  const direct = h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? h.get("cloudfront-viewer-country")
    ?? h.get("x-country-code") ?? h.get("fastly-geo-country-code");
  if (direct && /^[A-Za-z]{2}$/.test(direct)) return direct.toUpperCase();
  const nf = h.get("x-nf-geo");                     // Netlify: base64 JSON { country: { code } }
  if (nf) { try { const c = JSON.parse(atob(nf))?.country?.code; if (typeof c === "string") return c.toUpperCase(); } catch { /* ignore */ } }
  return null;
}

/** First supported language in an Accept-Language header, by quality. */
export function langFromAcceptLanguage(header: string | null): Lang | null {
  if (!header) return null;
  const ranked = header.split(",").map(part => {
    const [tag, ...params] = part.trim().split(";");
    const q = params.map(p => p.trim()).find(p => p.startsWith("q="));
    return { base: tag.toLowerCase().split("-")[0], q: q ? Number(q.slice(2)) || 0 : 1 };
  }).sort((a, b) => b.q - a.q);
  return (ranked.find(r => isLang(r.base))?.base as Lang | undefined) ?? null;
}

/** Order of precedence: the visitor's own choice, then their country, then their browser, then English. */
export function pickLang({ cookie, country, acceptLanguage }: { cookie?: string | null; country?: string | null; acceptLanguage?: string | null }): Lang {
  if (cookie && isLang(cookie)) return cookie;
  if (country && FRENCH_COUNTRIES.has(country)) return "fr";
  if (country && BILINGUAL_COUNTRIES.has(country)) return langFromAcceptLanguage(acceptLanguage ?? null) ?? "en";
  if (country) return "en";
  return langFromAcceptLanguage(acceptLanguage ?? null) ?? defaultLang;
}

/** A site path in a given language: English unprefixed, French under /fr. Leaves external links alone. */
export function lp(lang: Lang, path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (lang === "en") return path;
  return path === "/" ? "/fr" : path.startsWith("/#") ? `/fr${path.slice(1)}` : `/fr${path}`;
}

/** The same page in the other language, from a public path (with or without a /fr or /en prefix). */
export function switchPath(pathname: string, to: Lang): string {
  const bare = pathname.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";
  return lp(to, bare);
}
