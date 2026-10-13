import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GlassArt, NightArt, Blueprint } from "@/components/Art";
import { Icon } from "@/components/Icon";
import { Rail, Reveal } from "@/components/Interactive";
import { NewsArt, ProgrammeArt } from "@/components/NewsArt";
import { programmes } from "@/content/programmes";
import { news, monthYear } from "@/content/news";

export const metadata: Metadata = {
  title: "Research",
  description: "Namu AI Lab research: five programmes on full-duplex conversation, consented speech data, Zarma, data curation and honest measurement.",
  alternates: { canonical: "/research" },
};

const isHausa = (s: string) => /[ɓɗƙƴʼ]/.test(s);

/* Two sub-cards per programme band (Meta's research areas): real destinations only. */
const bandLinks: Record<string, { label: string; href: string; art: ReactNode }[]> = {
  hira: [
    { label: "Two voices, one timeline", href: "/programmes/hira#figure", art: <GlassArt motif="talk" palette="dusk" ratio="wide" /> },
    { label: "How Aïr is built", href: "/models/air", art: <GlassArt motif="mic" palette="apricot" ratio="wide" /> },
  ],
  rumbu: [
    { label: "Who is in Hausa speech data today", href: "/research/who-is-in-the-fleurs-hausa-test-set", art: <NightArt seed="fleurs-ha" tone="rose" ratio="wide" /> },
    { label: "How we will work with data", href: "/data", art: <GlassArt motif="stack" palette="sand" ratio="wide" /> },
  ],
  zarma: [
    { label: "The questions we are asking", href: "/programmes/zarma#questions", art: <GlassArt motif="glyph" ch="ẽ" palette="dusk" ratio="wide" /> },
    { label: "Where we are", href: "/programmes/zarma#progress", art: <Blueprint kind="measure" ratio="wide" /> },
  ],
  tankade: [
    { label: "The life of an utterance", href: "/programmes/tankade#figure", art: <Blueprint kind="pipeline" ratio="wide" /> },
    { label: "Where we are", href: "/programmes/tankade#progress", art: <GlassArt motif="bars" palette="sand" ratio="wide" /> },
  ],
  maauni: [
    { label: "Why we report every Hausa score twice", href: "/research/why-we-report-every-hausa-score-twice", art: <GlassArt motif="glyph" ch="ɗ" palette="ember" ratio="wide" /> },
    { label: "Winning the Swahili ASR challenge", href: "/research/swahili-asr-challenge", art: <GlassArt motif="bars" palette="dusk" ratio="wide" /> },
  ],
};

export default function Research() {
  return (
    <div className="page-top">
      <Reveal />
      <section className="wrap intro">
        <p className="eyebrow">Research</p>
        <h1 className="h1" style={{ fontSize: "clamp(40px, 4.6vw, 64px)" }}>We study how machines hear, understand and answer in the languages of the Sahel</h1>
      </section>

      <section className="section" aria-labelledby="h-prog" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head"><h2 id="h-prog" className="h2">Programmes<span className="sub">Five long-running research efforts, each with its own questions and milestones</span></h2><a className="pill" href="/programmes">View programmes</a></div>
        </div>
        <div className="rail-wrap">
          <Rail label="Research programmes" className="rail cards3">
            {programmes.map(p => (
              <a key={p.slug} className="acard" href={`/programmes/${p.slug}`}>
                <div className="art"><ProgrammeArt slug={p.slug} ratio="wide" /></div>
                <h3 className="h3" lang={isHausa(p.name) ? "ha" : undefined}>{p.name}</h3>
                <p>{p.sentence}</p>
                <span className="textlink"><span>Learn more</span><Icon name="chevron" size={16} stroke={1.6} className="rot-90" /></span>
              </a>
            ))}
          </Rail>
        </div>
      </section>

      <section id="latest" className="section" aria-labelledby="h-news">
        <div className="wrap">
          <div className="section-head"><h2 id="h-news" className="h2">Latest research</h2></div>
          <ul className="newsgrid">
            {news.map(n => (
              <li key={n.href} className="reveal">
                <a href={n.href}>
                  <div><p className="t">{n.title}</p><div className="metarow"><span>{monthYear(n.date)}</span><span>{n.topic}</span><span className="go">{n.external ? "namu-ai.org" : "Learn more"} <Icon name={n.external ? "external" : "chevron"} size={16} stroke={1.6} className={n.external ? undefined : "rot-90"} /></span></div></div>
                  <div className="thumb"><NewsArt art={n.art} /></div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {programmes.map(p => (
        <section key={p.slug} className="section" aria-labelledby={`b-${p.slug}`}>
          <div className="wrap band">
            <div className="band-side">
              <span className="overline">{p.title}</span>
              <h2 id={`b-${p.slug}`} className="h1" lang={isHausa(p.name) ? "ha" : undefined}>{p.name}</h2>
              <p>{p.sentence}</p>
            </div>
            <div className="band-main">
              <a className="band-media reveal" href={`/programmes/${p.slug}`} aria-label={`${p.name}: ${p.title}`}><ProgrammeArt slug={p.slug} ratio="wide" /></a>
              <p className="statement">{p.question}</p>
              <a className="pill lg dark" href={`/programmes/${p.slug}`}>Explore {p.name}</a>
              <div className="band-sub">
                {bandLinks[p.slug].map(b => <a key={b.href} href={b.href} className="reveal"><span className="art">{b.art}</span><span>{b.label}</span></a>)}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section" aria-labelledby="h-demos">
        <div className="wrap">
          <div className="section-head"><h2 id="h-demos" className="statement" style={{ fontSize: "clamp(32px, 3.4vw, 48px)" }}>Explore our figures<span className="sub h2-sub">Interactive figures that run in your browser, on real Hausa data</span></h2></div>
          <div className="demos">
            <a className="demo solid reveal" href="/research/why-we-report-every-hausa-score-twice">
              <span className="art"><GlassArt motif="glyph" ch="ƙ" palette="ember" ratio="square" /></span>
              <span className="statement">Score a Hausa transcript strictly, then folded, and see what folding hides</span>
              <span className="pill light">Strict and folded</span>
            </a>
            <a className="demo reveal" href="/research/who-is-in-the-fleurs-hausa-test-set">
              <span className="art"><NightArt seed="fleurs-ha" tone="rose" ratio="square" /></span>
              <span className="statement">Every utterance of the FLEURS Hausa test set, and who is speaking</span>
              <span className="pill light">The test set</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
