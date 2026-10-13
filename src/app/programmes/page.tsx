import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Interactive";
import { ProgrammeArt, darkArt } from "@/components/NewsArt";
import { programmes } from "@/content/programmes";

export const metadata: Metadata = {
  title: "Programmes",
  description: "The five research programmes of Namu AI Lab.",
  alternates: { canonical: "/programmes" },
};

export default function Programmes() {
  return (
    <div className="page-top">
      <Reveal />
      <section className="wrap intro">
        <p className="eyebrow">Programmes</p>
        <h1 className="h1" style={{ fontSize: "clamp(40px, 4.6vw, 64px)" }}>Five programmes, one aim: speech technology that works for the people of the Sahel</h1>
      </section>
      <section className="wrap" style={{ paddingBottom: 112 }}>
        <div className="cardgrid" style={{ marginTop: 0 }}>
          {programmes.map(p => (
            <a key={p.slug} href={`/programmes/${p.slug}`} className={`fcard reveal${darkArt.has(p.slug) ? " dark" : ""}`}>
              <div className="art"><ProgrammeArt slug={p.slug} /></div>
              <div className="txt"><p className="meta" style={{ margin: "0 0 8px", color: "inherit", opacity: .7 }}>{p.status}</p><h2 className="h3" lang={/[ɓɗƙƴʼ]/.test(p.name) ? "ha" : undefined}>{p.name}</h2><p>{p.title}</p></div>
              <div className="acts"><span className={`pill ${darkArt.has(p.slug) ? "light" : "dark"}`}>Learn more</span></div>
            </a>
          ))}
          <a href="/research" className="fcard reveal" style={{ background: "var(--surface)" }}>
            <div className="txt"><h2 className="h3">All research</h2><p>Posts, notes and interactive figures from every programme.</p></div>
            <div className="acts"><span className="pill dark">Explore research <Icon name="chevron" size={16} stroke={1.6} className="rot-90" /></span></div>
          </a>
        </div>
      </section>
    </div>
  );
}
