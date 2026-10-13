import type { Metadata } from "next";
import { GlassArt, NightArt, Blueprint } from "@/components/Art";
import { Reveal } from "@/components/Interactive";
import { Blossom } from "@/components/Logo";
import { aboutCopy } from "@/content/posts-new";

export const metadata: Metadata = {
  title: "About",
  description: aboutCopy.hero,
  alternates: { canonical: "/about" },
};

const principleArt = [
  <NightArt key="a" seed="about-consent" ratio="square" />,
  <GlassArt key="b" motif="talk" palette="apricot" ratio="square" place="centre" />,
  <Blueprint key="c" kind="measure" ratio="square" />,
  <GlassArt key="d" motif="stack" palette="sand" ratio="square" place="centre" />,
];

export default function About() {
  return (
    <div className="page-top">
      <Reveal />
      <section className="wrap intro">
        <p className="eyebrow">About</p>
        <h1 className="h1" style={{ fontSize: "clamp(40px, 4.6vw, 64px)" }}>{aboutCopy.hero}</h1>
      </section>
      <div className="mhero" style={{ paddingTop: 0 }}>
        <div className="mhero-card" style={{ minHeight: "min(560px, 70svh)" }}>
          <div className="art"><GlassArt motif="blossom" palette="haze" ratio="wide" place="centre" /></div>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <h2 className="twotone">{aboutCopy.intro[0]} <span>{aboutCopy.intro[1]}</span></h2>
          <p className="lede" style={{ marginTop: 32, maxWidth: "36em" }}>{aboutCopy.intro[2]}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="h-principles">
        <div className="wrap">
          <h2 id="h-principles" className="h2" style={{ marginBottom: 48 }}>How we work<span className="sub">Four commitments that come before any result</span></h2>
          <div className="datagrid">
            {aboutCopy.principles.map((p, i) => <div key={p.title} className="datum reveal"><div className="ic">{principleArt[i]}</div><div><h3 className="h3">{p.title}</h3><p>{p.body}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-people">
        <div className="wrap">
          <h2 id="h-people" className="h2" style={{ marginBottom: 48 }}>People<span className="sub">The Lab is led by Namu’s founders</span></h2>
          <div className="split">
            {aboutCopy.founders.map(f => (
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
            <h2 id="h-careers" className="statement">Help build speech AI for the languages you speak</h2>
            <p>{aboutCopy.careers}</p>
            <a className="pill lg dark" href="mailto:contact@namuai.org?subject=Working%20with%20Namu%20AI%20Lab">Get in touch</a>
          </div>
        </div>
      </section>
    </div>
  );
}
