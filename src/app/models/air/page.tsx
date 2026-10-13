import type { Metadata } from "next";
import { GlassArt, Blueprint } from "@/components/Art";
import { ConversationScore, BlossomPlayer } from "@/components/figures";
import { SectionTabs } from "@/components/PostTools";
import { Reveal } from "@/components/Interactive";
import { Icon } from "@/components/Icon";
import { programmeBySlug } from "@/content/programmes";

export const metadata: Metadata = {
  title: "Aïr",
  description: "Aïr is Namu AI Lab’s research system for full-duplex conversation in Hausa: it listens while it speaks.",
  alternates: { canonical: "/models/air" },
};

/* DeepMind model-page pattern (Gemini Audio): art hero with the name, a statement, sticky tabs,
   capability cards, hands-on, and the limits. Every claim follows the Hira programme's claims gate. */
export default function Air() {
  const hira = programmeBySlug("hira")!;
  const sections = [{ id: "listen", title: "Listen" }, { id: "how", title: "How it works" }, { id: "conversation", title: "Conversation" }, { id: "limits", title: "Limits" }];
  return (
    <article>
      <Reveal />
      <div className="mhero">
        <div className="mhero-card">
          <div className="art"><GlassArt motif="talk" palette="apricot" ratio="wide" /></div>
          <div>
            <span className="status"><i />In research</span>
            <h1 className="display">Aïr</h1>
            <p className="lede">A voice agent that holds a conversation in Hausa. It listens while it speaks, so it can wait, stop or acknowledge.</p>
          </div>
          <div className="acts">
            <a className="pill lg frost" href="#listen"><Icon name="play" size={16} stroke={1.6} />Hear Aïr</a>
            <a className="pill lg frost" href="#how">How it works</a>
            <a className="pill lg frost" href="/programmes/hira">The Hira programme</a>
          </div>
        </div>
      </div>

      <section className="wrap bigline"><p className="statement">People answer before a sentence ends, say “to” while the other person is still speaking, and stop when interrupted. Aïr is our research into speech that does the same, in Hausa.</p></section>

      <SectionTabs sections={sections} />

      <section id="listen" className="section" style={{ scrollMarginTop: 150 }}>
        <div className="wrap">
          <h2 className="twotone">Listen <span>A greeting in Aïr’s voice, with each word lit as it is spoken.</span></h2>
          <div className="fig" style={{ marginTop: 48, background: "var(--night)", color: "#fff", ["--fg" as string]: "#fff", ["--fg-2" as string]: "rgba(255,255,255,.78)", ["--fg-3" as string]: "rgba(255,255,255,.6)", ["--rule" as string]: "rgba(255,255,255,.18)" }}>
            {/* NATIVE-REVIEW: the greeting and its gloss. */}
            <BlossomPlayer duration={4.2} label="Aïr · greeting · Hausa" gloss="Hello, this is Namu. How can I help?"
              note="The recording will play here once the founders choose the sample and its consent record is published."
              words={[{ w: "Sannu,", start: .15, end: .7 }, { w: "Namu", start: .8, end: 1.25 }, { w: "ke", start: 1.3, end: 1.5 }, { w: "nan.", start: 1.55, end: 2 }, { w: "Me", start: 2.35, end: 2.55 }, { w: "zan", start: 2.6, end: 2.85 }, { w: "taimaka", start: 2.9, end: 3.5 }, { w: "maka?", start: 3.55, end: 4.05 }]} />
          </div>
        </div>
      </section>

      <section id="how" className="section" style={{ scrollMarginTop: 150 }}>
        <div className="wrap">
          <h2 className="twotone">How it works <span>Aïr splits the problem in three: an ear, a brain and a mouth, running as one live chain.</span></h2>
          <div className="cardgrid">
            <div className="tcard reveal"><div className="art"><GlassArt motif="mic" palette="apricot" ratio="card" /></div><h3 className="h3">The ear</h3><p>Turns Hausa speech into something a language model can read. Today that is still a transcript.</p></div>
            <div className="tcard reveal"><div className="art"><Blueprint kind="hira" ratio="card" /></div><h3 className="h3">The brain</h3><p>A third-party multilingual model, McGill’s AfriqueQwen, decides what to say. We do not retrain its weights.</p></div>
            <div className="tcard reveal"><div className="art"><GlassArt motif="talk" palette="dusk" ratio="card" /></div><h3 className="h3">The mouth</h3><p>Built on Kyutai’s Moshi architecture, it speaks while it keeps listening.</p></div>
          </div>
          <ol className="steps">
            {hira.ladder.slice(0, 3).map((r, i) => (
              <li key={i}><span className={`st ${r.state}`}><i />{r.state === "done" ? `Done${r.when ? ` · ${r.when}` : ""}` : r.state === "now" ? "In progress" : "Next"}</span><span className="t"><b>{r.title}</b>{r.detail && <span>{r.detail}</span>}</span></li>
            ))}
          </ol>
        </div>
      </section>

      <section id="conversation" className="section" style={{ scrollMarginTop: 150 }}>
        <div className="wrap">
          <h2 className="twotone">Two voices, one timeline <span>Overlap, backchannels and interruptions, drawn the way the Lab will show every recorded conversation.</span></h2>
          <figure style={{ margin: "48px 0 0" }}><div className="fig"><ConversationScore /></div><figcaption className="fig-cap">Lines from namu-ai.org’s Aïr page. Timing is illustrative until a consented two-speaker recording is published.</figcaption></figure>
        </div>
      </section>

      <section id="limits" className="section" style={{ scrollMarginTop: 150 }}>
        <div className="wrap split">
          <div className="panel"><h3 className="h3">What we do not claim yet</h3><ul>{hira.noClaim.map((n, i) => <li key={i}>{n}</li>)}</ul></div>
          <div>
            <h2 className="statement" style={{ fontSize: "clamp(30px, 2.8vw, 40px)" }}>Aïr is built in the open, one measurement at a time</h2>
            <p className="lede" style={{ margin: "20px 0 28px" }}>The Hira programme publishes the questions, the progress and the results, including what does not work.</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><a className="pill lg dark" href="/programmes/hira">Explore Hira</a><a className="pill lg" href="https://www.namu-ai.org/models/air">Aïr on namu-ai.org</a></div>
          </div>
        </div>
      </section>
    </article>
  );
}
