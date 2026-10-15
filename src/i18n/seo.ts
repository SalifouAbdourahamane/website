import type { Metadata } from "next";
import { lp, type Lang } from "./config";

/** Canonical URL plus hreflang alternates for a page that exists in both languages. */
export function alternates(lang: Lang, path: string): Metadata["alternates"] {
  return {
    canonical: lp(lang, path),
    languages: { en: lp("en", path), fr: lp("fr", path), "x-default": lp("en", path) },
  };
}
