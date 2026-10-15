import type { Metadata } from "next";
import { GlassArt, Blueprint } from "@/components/Art";
import { ConversationScore, BlossomPlayer } from "@/components/figures";
import { SectionTabs } from "@/components/PostTools";
import { Reveal } from "@/components/Interactive";
import { Icon } from "@/components/Icon";
import { getProgramme } from "@/content";
import { isLang, lp, type Lang } from "@/i18n/config";
import { copy } from "@/i18n/copy";
import { alternates } from "@/i18n/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; const l: Lang = isLang(lang) ? lang : "en";
  const [title, description] = copy[l].meta.air;
  return { title, description, alternates: alternates(l, "/models/air") };
}

/* DeepMind model-page pattern (Gemini Audio): art hero with the name, a statement, sticky tabs,
   capability cards, hands-on, and the limits. Every claim follows the Hira programme's claims gate. */
export default async function Air({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang;
  const c = copy[lang], a = c.air;
  const L = (p: string) => lp(lang, p);
  const hira = getProgramme(lang, "hira")!;
  const sections = [{ id: "listen", title: a.tabs.listen }, { id: "how", title: a.tabs.how }, { id: "conversation", title: a.tabs.conversation }, { id: "limits", title: a.tabs.limits }];
  const art = [<GlassArt key="0" motif="mic" palette="apricot" ratio="card" />, <Blueprint key="1" kind="hira" ratio="card" />, <GlassArt key="2" motif="talk" palette="dusk" ratio="card" />];
  return (
    <article>
      <Reveal />
      <div className="mhero">
        <div className="mhero-card">
          <div className="art"><GlassArt motif="talk" palette="apricot" ratio="wide" /></div>
          <div>
            <span className="status"><i />{a.status}</span>
            <h1 className="display">Aïr</h1>
            <p className="lede">{a.lede}</p>
          </div>
          <div className="acts">
            <a className="pill lg frost" href="#listen"><Icon name="play" size={16} stroke={1.6} />{a.hear}</a>
            <a className="pill lg frost" href="#how">{a.how}</a>
            <a className="pill lg frost" href={L("/programmes/hira")}>{a.hira}</a>
          </div>
        </div>
      </div>

      <section className="wrap bigline"><p className="statement">{a.statement}</p></section>

      <SectionTabs sections={sections} />

      <section id="listen" className="section" style={{ scrollMarginTop: 150 }}>
        <div className="wrap">
          <h2 className="twotone">{a.listen} <span>{a.listenSub}</span></h2>
          <div className="fig" style={{ marginTop: 48, background: "var(--night)", color: "#fff", ["--fg" as string]: "#fff", ["--fg-2" as string]: "rgba(255,255,255,.78)", ["--fg-3" as string]: "rgba(255,255,255,.6)", ["--rule" as string]: "rgba(255,255,255,.18)" }}>
            {/* NATIVE-REVIEW: the greeting and its gloss. */}
            <BlossomPlayer lang={lang} duration={4.2} label={a.playerLabel} gloss={a.playerGloss} note={a.playerNote}
              words={[{ w: "Sannu,", start: .15, end: .7 }, { w: "Namu", start: .8, end: 1.25 }, { w: "ke", start: 1.3, end: 1.5 }, { w: "nan.", start: 1.55, end: 2 }, { w: "Me", start: 2.35, end: 2.55 }, { w: "zan", start: 2.6, end: 2.85 }, { w: "taimaka", start: 2.9, end: 3.5 }, { w: "maka?", start: 3.55, end: 4.05 }]} />
          </div>
        </div>
      </section>

      <section id="how" className="section" style={{ scrollMarginTop: 150 }}>
        <div className="wrap">
          <h2 className="twotone">{a.how} <span>{a.howSub}</span></h2>
          <div className="cardgrid">
            {a.parts.map((p, i) => <div key={p.t} className="tcard reveal"><div className="art">{art[i]}</div><h3 className="h3">{p.t}</h3><p>{p.d}</p></div>)}
          </div>
          <ol className="steps">
            {hira.ladder.slice(0, 3).map((r, i) => (
              <li key={i}><span className={`st ${r.state}`}><i />{c.programme.states[r.state]}{r.when ? ` · ${r.when}` : ""}</span><span className="t"><b>{r.title}</b>{r.detail && <span>{r.detail}</span>}</span></li>
            ))}
          </ol>
        </div>
      </section>

      <section id="conversation" className="section" style={{ scrollMarginTop: 150 }}>
        <div className="wrap">
          <h2 className="twotone">{a.convo} <span>{a.convoSub}</span></h2>
          <figure style={{ margin: "48px 0 0" }}><div className="fig"><ConversationScore lang={lang} /></div><figcaption className="fig-cap">{c.programme.figures.hira.cap}</figcaption></figure>
        </div>
      </section>

      <section id="limits" className="section" style={{ scrollMarginTop: 150 }}>
        <div className="wrap split">
          <div className="panel"><h3 className="h3">{c.programme.noClaim}</h3><ul>{hira.noClaim.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
          <div>
            <h2 className="statement" style={{ fontSize: "clamp(30px, 2.8vw, 40px)" }}>{a.open}</h2>
            <p className="lede" style={{ margin: "20px 0 28px" }}>{a.openSub}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><a className="pill lg dark" href={L("/programmes/hira")}>{a.exploreHira}</a><a className="pill lg" href="https://www.namu-ai.org/models/air">{a.onNamu}</a></div>
          </div>
        </div>
      </section>
    </article>
  );
}
