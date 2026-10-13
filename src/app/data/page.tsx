import type { Metadata } from "next";
import { GlassArt, NightArt, Blueprint } from "@/components/Art";
import { Reveal } from "@/components/Interactive";
import { NewsArt } from "@/components/NewsArt";
import { news, monthYear } from "@/content/news";
import { programmeBySlug } from "@/content/programmes";

export const metadata: Metadata = {
  title: "Data",
  description: "How Namu AI Lab will collect, clean and measure Hausa and Zarma speech: with consent, fair pay and a data statement for every release.",
  alternates: { canonical: "/data" },
};

/* After afterquery.com: a narrow reading column (problem, solution, what the data includes),
   one wide image, research cards, and a coloured closing band. Copy from the Rumbu, Tankaɗe and
   Maʼauni programmes; nothing here says data exists that does not. */
export default function Data() {
  const rumbu = programmeBySlug("rumbu")!;
  const notes = news.filter(n => ["fleurs", "strict", "intro"].includes(n.art));
  return (
    <div className="page-top">
      <Reveal />
      <section className="wrap intro" style={{ textAlign: "left", maxWidth: "calc(760px + 2 * var(--gutter))" }}>
        <p className="eyebrow">Data</p>
        <h1 className="h1">Hausa as people speak it, recorded with their consent</h1>
        <p className="lede" style={{ margin: "24px 0 0" }}>Speech models learn the language they are given. We are building the Hausa and Zarma speech that public datasets leave out, with the people who speak it.</p>
        <div className="acts" style={{ justifyContent: "flex-start" }}><a className="pill lg dark" href="/programmes/rumbu">The Rumbu programme</a><a className="pill lg" href="/programmes/maauni">How we measure</a></div>
      </section>

      <div className="wrap"><div className="post-media reveal" style={{ aspectRatio: "1296 / 560" }}><NightArt seed="data-hero" ratio="wide" /></div></div>

      <section className="prose" style={{ paddingTop: 88 }}>
        <p className="eyebrow">Problem</p>
        <h2 style={{ marginTop: 12 }}>Public Hausa speech is narrow</h2>
        <p>{rumbu.description[0]}</p>
        <p className="eyebrow" style={{ marginTop: 56 }}>Our approach</p>
        <h2 style={{ marginTop: 12 }}>Collect it together, with clear rules</h2>
        <p>{rumbu.description[1]}</p>
        <p>{rumbu.description[2]}</p>
        <p>{rumbu.description[3]}</p>
      </section>

      <section className="section" aria-labelledby="h-incl">
        <div className="wrap" style={{ maxWidth: "calc(1000px + 2 * var(--gutter))" }}>
          <h2 id="h-incl" className="h2" style={{ marginBottom: 48 }}>What our data will include<span className="sub">Rumbu is opening: nothing has been collected yet</span></h2>
          <div className="datagrid">
            {[
              { art: <GlassArt motif="talk" palette="apricot" ratio="square" place="centre" />, t: "Two-person conversation", b: "Speakers on separate channels, so overlap, backchannels and interruptions survive for full-duplex research." },
              { art: <GlassArt motif="mic" palette="sand" ratio="square" place="centre" />, t: "Ordinary phone calls", b: "Speech over the phone lines people actually use, as well as apps." },
              { art: <GlassArt motif="glyph" ch="ƙ" palette="ember" ratio="square" place="centre" />, t: "Regional varieties", b: "Hausa from Niger and Nigeria, written in the orthography each country uses." },
              { art: <Blueprint kind="measure" ratio="square" />, t: "Frozen test sets", b: "Speaker-disjoint, dialect- and gender-stratified, frozen before training data is collected." },
            ].map(d => <div key={d.t} className="datum reveal"><div className="ic">{d.art}</div><div><h3 className="h3">{d.t}</h3><p>{d.b}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-notes">
        <div className="wrap">
          <div className="section-head"><h2 id="h-notes" className="h2">Research<span className="sub">Notes on the data we measure against</span></h2><a className="pill" href="/research#latest">More research</a></div>
          <div className="cardgrid" style={{ marginTop: 0 }}>
            {notes.map(n => (
              <a key={n.href} className="acard" href={n.href}>
                <div className="art" style={{ aspectRatio: "1" }}><NewsArt art={n.art} /></div>
                <h3 className="h3">{n.title}</h3>
                <div className="metarow"><span>{monthYear(n.date)}</span><span>{n.topic}</span></div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 112 }}>
        <div className="demo solid" style={{ aspectRatio: "auto", minHeight: 280, borderRadius: 24 }}>
          <span className="art"><GlassArt motif="stack" palette="ember" ratio="wide" /></span>
          <span className="statement">Partner with us on Rumbu</span>
          <span style={{ maxWidth: 40 + "em", marginTop: 12, opacity: .9 }}>{rumbu.collaborate}</span>
          <a className="pill light" href="mailto:contact@namuai.org?subject=Rumbu%2C%20Namu%20AI%20Lab">Get in touch</a>
        </div>
      </section>
    </div>
  );
}
