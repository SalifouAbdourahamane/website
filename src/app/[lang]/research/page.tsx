import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GlassArt, NightArt, Blueprint } from "@/components/Art";
import { Icon } from "@/components/Icon";
import { Rail, Reveal } from "@/components/Interactive";
import { NewsArt, ProgrammeArt } from "@/components/NewsArt";
import { getNews, getProgrammes, monthYear } from "@/content";
import { isLang, lp, type Lang } from "@/i18n/config";
import { copy } from "@/i18n/copy";
import { alternates } from "@/i18n/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; const l: Lang = isLang(lang) ? lang : "en";
  const [title, description] = copy[l].meta.research;
  return { title, description, alternates: alternates(l, "/research") };
}

const isHausa = (s: string) => /[ɓɗƙƴʼ]/.test(s);

/* Two sub-cards per programme band (Meta's research areas): real destinations only. */
const bandLinks: Record<string, { href: string; art: ReactNode }[]> = {
  hira: [{ href: "/programmes/hira#figure", art: <GlassArt motif="talk" palette="dusk" ratio="wide" /> }, { href: "/models/air", art: <GlassArt motif="mic" palette="apricot" ratio="wide" /> }],
  rumbu: [{ href: "/research/who-is-in-the-fleurs-hausa-test-set", art: <NightArt seed="fleurs-ha" tone="rose" ratio="wide" /> }, { href: "/data", art: <GlassArt motif="stack" palette="sand" ratio="wide" /> }],
  zarma: [{ href: "/programmes/zarma#questions", art: <GlassArt motif="glyph" ch="ẽ" palette="dusk" ratio="wide" /> }, { href: "/programmes/zarma#progress", art: <Blueprint kind="measure" ratio="wide" /> }],
  tankade: [{ href: "/programmes/tankade#figure", art: <Blueprint kind="pipeline" ratio="wide" /> }, { href: "/programmes/tankade#progress", art: <GlassArt motif="bars" palette="sand" ratio="wide" /> }],
  maauni: [{ href: "/research/why-we-report-every-hausa-score-twice", art: <GlassArt motif="glyph" ch="ɗ" palette="ember" ratio="wide" /> }, { href: "/research/swahili-asr-challenge", art: <GlassArt motif="bars" palette="dusk" ratio="wide" /> }],
};

export default async function Research({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang;
  const c = copy[lang], r = c.research;
  const L = (p: string) => lp(lang, p);
  const programmes = getProgrammes(lang);
  return (
    <div className="page-top">
      <Reveal />
      <section className="wrap intro">
        <p className="eyebrow">{r.eyebrow}</p>
        <h1 className="h1" style={{ fontSize: "clamp(40px, 4.6vw, 64px)" }}>{r.h1}</h1>
      </section>

      <section className="section" aria-labelledby="h-prog" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head"><h2 id="h-prog" className="h2">{r.programmes}<span className="sub">{r.programmesSub}</span></h2><a className="pill" href={L("/programmes")}>{r.viewProgrammes}</a></div>
        </div>
        <div className="rail-wrap">
          <Rail label={r.programmes} className="rail cards3" prev={c.common.previous} next={c.common.next}>
            {programmes.map(p => (
              <a key={p.slug} className="acard" href={L(`/programmes/${p.slug}`)}>
                <div className="art"><ProgrammeArt slug={p.slug} ratio="wide" /></div>
                <h3 className="h3" lang={isHausa(p.name) ? "ha" : undefined}>{p.name}</h3>
                <p>{p.sentence}</p>
                <span className="textlink"><span>{c.common.learnMore}</span><Icon name="chevron" size={16} stroke={1.6} className="rot-90" /></span>
              </a>
            ))}
          </Rail>
        </div>
      </section>

      <section id="latest" className="section" aria-labelledby="h-news">
        <div className="wrap">
          <div className="section-head"><h2 id="h-news" className="h2">{r.latest}</h2></div>
          <ul className="newsgrid">
            {getNews(lang).map(n => (
              <li key={n.href} className="reveal">
                <a href={L(n.href)} hrefLang={n.external && lang === "fr" ? "en" : undefined}>
                  <div><p className="t">{n.title}</p><div className="metarow"><span>{monthYear(n.date, lang)}</span><span>{n.topic}</span>{n.note && <span>{n.note}</span>}<span className="go">{n.external ? "namu-ai.org" : c.common.learnMore} <Icon name={n.external ? "external" : "chevron"} size={16} stroke={1.6} className={n.external ? undefined : "rot-90"} /></span></div></div>
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
              <a className="band-media reveal" href={L(`/programmes/${p.slug}`)} aria-label={`${p.name}: ${p.title}`}><ProgrammeArt slug={p.slug} ratio="wide" /></a>
              <p className="statement">{p.question}</p>
              <a className="pill lg dark" href={L(`/programmes/${p.slug}`)}>{c.common.explore(p.name)}</a>
              <div className="band-sub">
                {bandLinks[p.slug].map((b, i) => <a key={b.href} href={L(b.href)} className="reveal"><span className="art">{b.art}</span><span>{r.bands[p.slug][i]}</span></a>)}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section" aria-labelledby="h-demos">
        <div className="wrap">
          <div className="section-head"><h2 id="h-demos" className="statement" style={{ fontSize: "clamp(32px, 3.4vw, 48px)" }}>{r.figures}<span className="sub h2-sub">{r.figuresSub}</span></h2></div>
          <div className="demos">
            <a className="demo solid reveal" href={L("/research/why-we-report-every-hausa-score-twice")}>
              <span className="art"><GlassArt motif="glyph" ch="ƙ" palette="ember" ratio="square" /></span>
              <span className="statement">{r.demo1}</span>
              <span className="pill light">{r.demo1Cta}</span>
            </a>
            <a className="demo reveal" href={L("/research/who-is-in-the-fleurs-hausa-test-set")}>
              <span className="art"><NightArt seed="fleurs-ha" tone="rose" ratio="square" /></span>
              <span className="statement">{r.demo2}</span>
              <span className="pill light">{r.demo2Cta}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
