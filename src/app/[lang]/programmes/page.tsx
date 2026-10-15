import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Interactive";
import { ProgrammeArt, darkArt } from "@/components/NewsArt";
import { getProgrammes } from "@/content";
import { isLang, lp, type Lang } from "@/i18n/config";
import { copy } from "@/i18n/copy";
import { alternates } from "@/i18n/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; const l: Lang = isLang(lang) ? lang : "en";
  const [title, description] = copy[l].meta.programmes;
  return { title, description, alternates: alternates(l, "/programmes") };
}

export default async function Programmes({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang;
  const c = copy[lang], t = c.programmes;
  const L = (p: string) => lp(lang, p);
  return (
    <div className="page-top">
      <Reveal />
      <section className="wrap intro">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="h1" style={{ fontSize: "clamp(40px, 4.6vw, 64px)" }}>{t.h1}</h1>
      </section>
      <section className="wrap" style={{ paddingBottom: 112 }}>
        <div className="cardgrid" style={{ marginTop: 0 }}>
          {getProgrammes(lang).map(p => (
            <a key={p.slug} href={L(`/programmes/${p.slug}`)} className={`fcard reveal${darkArt.has(p.slug) ? " dark" : ""}`}>
              <div className="art"><ProgrammeArt slug={p.slug} /></div>
              <div className="txt"><p className="meta" style={{ margin: "0 0 8px", color: "inherit", opacity: .7 }}>{c.status[p.status] ?? p.status}</p><h2 className="h3" lang={/[ɓɗƙƴʼ]/.test(p.name) ? "ha" : undefined}>{p.name}</h2><p>{p.title}</p></div>
              <div className="acts"><span className={`pill ${darkArt.has(p.slug) ? "light" : "dark"}`}>{c.common.learnMore}</span></div>
            </a>
          ))}
          <a href={L("/research")} className="fcard reveal" style={{ background: "var(--surface)" }}>
            <div className="txt"><h2 className="h3">{t.all}</h2><p>{t.allSub}</p></div>
            <div className="acts"><span className="pill dark">{t.allCta} <Icon name="chevron" size={16} stroke={1.6} className="rot-90" /></span></div>
          </a>
        </div>
      </section>
    </div>
  );
}
