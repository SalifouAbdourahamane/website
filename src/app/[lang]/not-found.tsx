"use client";

import { usePathname } from "next/navigation";
import { lp, type Lang } from "@/i18n/config";
import { copy } from "@/i18n/copy";

/* Not-found pages receive no route params, so the language comes from the URL. */
export default function NotFound() {
  const lang: Lang = /^\/fr(\/|$)/.test(usePathname() || "") ? "fr" : "en";
  const t = copy[lang].notFound;
  return (
    <section className="page-top wrap intro" style={{ minHeight: "70svh", display: "grid", alignContent: "center" }}>
      <p className="eyebrow">{t.eyebrow}</p>
      <h1 className="h1">{t.h1}</h1>
      <p className="lede">{t.body}</p>
      <div className="acts"><a className="pill lg dark" href={lp(lang, "/")}>{t.home}</a><a className="pill lg" href={lp(lang, "/research")}>{t.research}</a></div>
    </section>
  );
}
