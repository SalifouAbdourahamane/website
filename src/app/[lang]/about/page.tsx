import type { Metadata } from "next";
import { GlassArt, NightArt, Blueprint } from "@/components/Art";
import { Reveal } from "@/components/Interactive";
import { Blossom } from "@/components/Logo";
import { getAbout } from "@/content";
import { isLang, type Lang } from "@/i18n/config";
import { copy } from "@/i18n/copy";
import { alternates } from "@/i18n/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; const l: Lang = isLang(lang) ? lang : "en";
  const [title, description] = copy[l].meta.about;
  return { title, description, alternates: alternates(l, "/about") };
}

const principleArt = [
  <NightArt key="a" seed="about-consent" ratio="square" />,
  <GlassArt key="b" motif="talk" palette="apricot" ratio="square" place="centre" />,
  <Blueprint key="c" kind="measure" ratio="square" />,
  <GlassArt key="d" motif="stack" palette="sand" ratio="square" place="centre" />,
];

export default async function About({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang;
  const c = copy[lang], a = c.about;
  const about = getAbout(lang);
  return (
    <div className="page-top">
      <Reveal />
      <section className="wrap intro">
        <p className="eyebrow">{a.eyebrow}</p>
        <h1 className="h1" style={{ fontSize: "clamp(40px, 4.6vw, 64px)" }}>{about.hero}</h1>
      </section>
      <div className="mhero" style={{ paddingTop: 0 }}>
        <div className="mhero-card" style={{ minHeight: "min(560px, 70svh)" }}>
          <div className="art"><GlassArt motif="blossom" palette="haze" ratio="wide" place="centre" /></div>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <h2 className="twotone">{about.intro[0]} <span>{about.intro[1]}</span></h2>
          <p className="lede" style={{ marginTop: 32, maxWidth: "36em" }}>{about.intro[2]}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="h-principles">
        <div className="wrap">
          <h2 id="h-principles" className="h2" style={{ marginBottom: 48 }}>{a.how}<span className="sub">{a.howSub}</span></h2>
          <div className="datagrid">
            {about.principles.map((p, i) => <div key={p.title} className="datum reveal"><div className="ic">{principleArt[i]}</div><div><h3 className="h3">{p.title}</h3><p>{p.body}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-people">
        <div className="wrap">
          <h2 id="h-people" className="h2" style={{ marginBottom: 48 }}>{a.people}<span className="sub">{a.peopleSub}</span></h2>
          <div className="split">
            {about.founders.map(f => (
              <div key={f.name} className="panel reveal">
                <div style={{ width: 64, height: 64, borderRadius: 18, background: "#fff", display: "grid", placeItems: "center", marginBottom: 28 }}><Blossom size={36} /></div>
                <h3 className="h3" style={{ marginBottom: 2 }}>{f.name}</h3>
                <p className="meta" style={{ margin: "0 0 16px" }}>{f.role}</p>
                <p style={{ margin: 0, color: "var(--ink-2)" }}>{f.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="careers" className="section" aria-labelledby="h-careers" style={{ scrollMarginTop: 80 }}>
        <div className="wrap join">
          <div className="pic reveal"><GlassArt motif="talk" palette="dusk" ratio="square" place="centre" /></div>
          <div>
            <h2 id="h-careers" className="statement">{a.careers}</h2>
            <p>{about.careers}</p>
            <a className="pill lg dark" href="mailto:contact@namuai.org?subject=Namu%20AI%20Lab">{c.common.getInTouch}</a>
          </div>
        </div>
      </section>
    </div>
  );
}
