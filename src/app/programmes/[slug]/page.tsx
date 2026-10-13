import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { programmes, programmeBySlug } from "@/content/programmes";
import { SectionTabs } from "@/components/PostTools";
import { ConversationScore, StrictFolded, TestSetStrip, UtterancePipeline } from "@/components/figures";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Interactive";
import { GlassArt, NightArt, Blueprint } from "@/components/Art";
import { ProgrammeArt, darkArt } from "@/components/NewsArt";

export const dynamicParams = false;
export function generateStaticParams() { return programmes.map(p => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = programmeBySlug((await params).slug);
  if (!p) return {};
  return { title: `${p.name}: ${p.title}`, description: p.sentence, alternates: { canonical: `/programmes/${p.slug}` } };
}

/* Each programme's interactive figure and its three overview cards (art from the Lab set). */
const figure: Record<string, { title: string; sub: string; node: ReactNode; cap: string } | undefined> = {
  hira: { title: "Two voices, one timeline", sub: "Full duplex means overlap, backchannels and interruptions. This is how the Lab will show them for every recorded conversation.", node: <ConversationScore />,
    cap: "Lines from namu-ai.org’s Aïr page. Timing is illustrative until a consented two-speaker recording is published." },
  rumbu: { title: "Who is in Hausa speech data today", sub: "Every utterance of the FLEURS Hausa test split, in file order, coloured by the gender recorded in the dataset.", node: <TestSetStrip />,
    cap: "Source: google/fleurs, data/ha_ng/test.tsv, CC BY 4.0, read 12 October 2026." },
  tankade: { title: "The life of an utterance", sub: "Recorded, segmented, aligned, normalised and checked against the speaker’s consent.", node: <UtterancePipeline />,
    cap: "Illustrative audio; the steps are the pipeline’s. Use the numbered steps to walk through it." },
  maauni: { title: "Strict and folded", sub: "One transcript scored two ways, computed in your browser with word-level alignment.", node: <StrictFolded />,
    cap: "Folding hooked letters halves this error rate and hides the mistake a Hausa reader notices first." },
};
const overview: Record<string, { t: string; d: string; art: ReactNode; dark?: boolean }[]> = {
  hira: [
    { t: "An ear", d: "Turns Hausa speech into something a language model can read.", art: <GlassArt motif="mic" palette="apricot" ratio="card" /> },
    { t: "A brain", d: "A multilingual model, whose weights we do not retrain, decides what to say.", art: <Blueprint kind="hira" ratio="card" /> },
    { t: "A mouth", d: "Built on Kyutai’s Moshi architecture, it speaks while it keeps listening.", art: <GlassArt motif="talk" palette="dusk" ratio="card" /> },
  ],
  rumbu: [
    { t: "Conversation", d: "Two people on separate channels, and calls over ordinary phones.", art: <GlassArt motif="talk" palette="apricot" ratio="card" /> },
    { t: "Consent", d: "Every speaker chooses what their voice may be used for, and is paid.", art: <NightArt seed="rumbu-consent" ratio="card" />, dark: true },
    { t: "Coverage", d: "Regional varieties from Niger and Nigeria, including people who do not read.", art: <GlassArt motif="stack" palette="sand" ratio="card" /> },
  ],
  zarma: [
    { t: "Orthography", d: "A normaliser vetted by Zarma writers outside the founding team.", art: <GlassArt motif="glyph" ch="ŋ" palette="dusk" ratio="card" /> },
    { t: "A test set first", d: "A few consented hours, verified twice and frozen.", art: <Blueprint kind="measure" ratio="card" /> },
    { t: "Baselines", d: "Existing systems on that test set, scored strict and folded.", art: <GlassArt motif="bars" palette="apricot" ratio="card" /> },
  ],
  tankade: [
    { t: "Segment", d: "Cut long broadcasts and field recordings into utterances.", art: <GlassArt motif="bars" palette="sand" ratio="card" /> },
    { t: "Agree", d: "Keep what two recognisers agree on, align it word by word.", art: <Blueprint kind="pipeline" ratio="card" /> },
    { t: "Repair", d: "Restore hooked letters and spelling, and tag every licence.", art: <GlassArt motif="sieve" palette="apricot" ratio="card" /> },
  ],
  maauni: [
    { t: "Test sets", d: "Frozen, speaker-disjoint, with their cells and limits stated.", art: <Blueprint kind="measure" ratio="card" /> },
    { t: "Normalisation", d: "Strict and folded forms, published with test cases.", art: <GlassArt motif="glyph" ch="ƙ" palette="ember" ratio="card" />, dark: true },
    { t: "Listening", d: "Blind, multi-rater protocols with agreement published.", art: <GlassArt motif="mic" palette="dusk" ratio="card" /> },
  ],
};
const stateLabel = { done: "Done", now: "In progress", next: "Next" } as const;

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const p = programmeBySlug((await params).slug);
  if (!p) notFound();
  const ha = /[ɓɗƙƴʼ]/.test(p.name) ? "ha" : undefined;
  const fig = figure[p.slug];
  const sections = [
    { id: "overview", title: "Overview" },
    ...(fig ? [{ id: "figure", title: "In detail" }] : []),
    { id: "questions", title: "Questions" },
    { id: "progress", title: "Progress" },
    { id: "collaborate", title: "Collaborate" },
  ];
  const others = programmes.filter(x => x.slug !== p.slug);
  const ld = { "@context": "https://schema.org", "@type": "ResearchProject", name: `${p.name}: ${p.title}`, description: p.sentence,
    parentOrganization: { "@type": "Organization", "@id": "https://lab.namu-ai.org/#org", name: "Namu AI Lab" } };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Reveal />
      <div className="mhero">
        <div className={`mhero-card${darkArt.has(p.slug) ? " dark" : ""}`}>
          <div className="art"><ProgrammeArt slug={p.slug} ratio="wide" /></div>
          <div>
            <span className="status"><i />{p.status}</span>
            <h1 className="display" lang={ha}>{p.name}</h1>
            <p className="lede">{p.title}</p>
          </div>
          <div className="acts">
            <a className={`pill lg ${darkArt.has(p.slug) ? "on-dark" : "frost"}`} href="#questions">Read the questions</a>
            <a className={`pill lg ${darkArt.has(p.slug) ? "on-dark" : "frost"}`} href="#progress">See progress</a>
            <a className={`pill lg ${darkArt.has(p.slug) ? "on-dark" : "frost"}`} href="#collaborate">Collaborate</a>
          </div>
        </div>
      </div>

      <section className="wrap bigline"><p className="statement">{p.question}</p></section>

      <SectionTabs sections={sections} />

      <section id="overview" className="section" style={{ scrollMarginTop: 150 }}>
        <div className="wrap">
          <h2 className="twotone">{p.sentence} <span>{p.description[0].split(/(?<=[.?!])\s/)[0]}</span></h2>
          <div className="cardgrid">
            {overview[p.slug].map(c => (
              <div key={c.t} className={`tcard reveal${c.dark ? " dark" : ""}`}>
                <div className="art">{c.art}</div>
                <h3 className="h3">{c.t}</h3><p>{c.d}</p>
              </div>
            ))}
          </div>
          <div className="split" style={{ marginTop: 72 }}>
            <div className="prose" style={{ padding: 0, margin: 0 }}>{p.description.map((d, i) => <p key={i}>{d}</p>)}</div>
            <div className="panel reveal">
              <h3 className="h3">What we do not claim yet</h3>
              <ul>{p.noClaim.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      {fig && (
        <section id="figure" className="section" style={{ scrollMarginTop: 150 }}>
          <div className="wrap">
            <h2 className="twotone">{fig.title} <span>{fig.sub}</span></h2>
            <figure style={{ margin: "48px 0 0" }}><div className="fig">{fig.node}</div><figcaption className="fig-cap">{fig.cap}</figcaption></figure>
          </div>
        </section>
      )}

      <section id="questions" className="section" style={{ scrollMarginTop: 150 }}>
        <div className="wrap">
          <h2 className="h2">Questions<span className="sub">What this programme sets out to answer</span></h2>
          <ol className="qgrid">{p.questions.map((q, i) => <li key={i} className="reveal"><span className="n">{String(i + 1).padStart(2, "0")}</span><p>{q}</p></li>)}</ol>
        </div>
      </section>

      <section id="progress" className="section" style={{ scrollMarginTop: 150 }}>
        <div className="wrap">
          <h2 className="h2">Progress<span className="sub">Dates appear only on finished steps</span></h2>
          <ol className="steps">
            {p.ladder.map((r, i) => (
              <li key={i} className="reveal">
                <span className={`st ${r.state}`}><i />{stateLabel[r.state]}{r.when ? ` · ${r.when}` : ""}</span>
                <span className="t"><b>{r.title}</b>{r.detail && <span>{r.detail}</span>}</span>
              </li>
            ))}
          </ol>
          <div className="panel" style={{ marginTop: 48 }}>
            <h3 className="h3">What we will release</h3>
            <ul>{p.outputs.map((o, i) => <li key={i}>{o}</li>)}</ul>
          </div>
        </div>
      </section>

      <section id="collaborate" className="section" style={{ scrollMarginTop: 150 }}>
        <div className="wrap split">
          <div>
            <h2 className="statement" style={{ fontSize: "clamp(30px, 2.8vw, 40px)" }}>Work with us on {p.name}</h2>
            <p className="lede" style={{ margin: "20px 0 28px" }}>{p.collaborate}</p>
            <a className="pill lg dark" href={`mailto:contact@namuai.org?subject=${encodeURIComponent(`${p.name}, Namu AI Lab`)}`}>Get in touch</a>
          </div>
          <div>
            <h3 className="h3" style={{ marginBottom: 16 }}>Related reading</h3>
            <ul className="reflist">{p.related.map(r => <li key={r.href}><a href={r.href}><span>{r.label}</span><Icon name="external" size={18} stroke={1.5} /></a></li>)}</ul>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-other">
        <div className="wrap">
          <div className="section-head"><h2 id="h-other" className="h2">More research</h2><a className="pill" href="/research">All research</a></div>
          <div className="models" style={{ gridAutoColumns: "minmax(280px, 1fr)" }}>
            {others.map(o => (
              <a key={o.slug} className="acard" href={`/programmes/${o.slug}`}>
                <div className="art"><ProgrammeArt slug={o.slug} ratio="wide" /></div>
                <h3 className="h3" lang={/[ɓɗƙƴʼ]/.test(o.name) ? "ha" : undefined}>{o.name}</h3>
                <p>{o.sentence}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
