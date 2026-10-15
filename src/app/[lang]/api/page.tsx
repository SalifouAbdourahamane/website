import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GlassArt, NightArt } from "@/components/Art";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Interactive";
import { apiCopy } from "@/content/api";
import { isLang, lp, type Lang } from "@/i18n/config";
import { alternates } from "@/i18n/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; const l: Lang = isLang(lang) ? lang : "en";
  const [title, description] = apiCopy[l].meta;
  return { title, description, alternates: alternates(l, "/api") };
}

const mail = (subject: string) => `mailto:contact@namuai.org?subject=${encodeURIComponent(subject)}`;
const EARLY = mail("Namu API, early access");
const TALK = mail("Namu API");

/* One picture per model, warm glass for the models in development and the night ground for Aïr. */
const modelArt: Record<string, ReactNode> = {
  tatsuniya: <GlassArt motif="mic" palette="sand" ratio="card" place="centre" />,
  tafiya: <GlassArt motif="bars" palette="apricot" ratio="card" place="centre" />,
  kora: <GlassArt motif="talk" palette="dusk" ratio="card" place="centre" />,
  air: <NightArt seed="api-air" ratio="card" />,
};
const useArt = [["talk", "apricot"], ["bars", "sand"], ["stack", "dusk"], ["mic", "haze"], ["sieve", "apricot"], ["glyph", "sand"]] as const;
const stripIcons = ["transcript", "volume", "translate", "full-duplex", "language", "language"];

/* An illustrative request, shaped like the Lab's internal transcription service; no real host is shown.
   HA-REVIEW: the sample Hausa ("Sannu, ina kwana?") needs a native speaker's check before publication. */
function CodeWindow() {
  return (
    <div className="api-code" aria-label="Illustrative API request">
      <div className="api-code-bar"><i /><i /><i /><span>transcribe.sh</span></div>
      <pre>{`curl api.namu-ai.org/v1/transcribe \\
  -H "Authorization: Bearer $NAMU_API_KEY" \\
  -F model="tatsuniya" \\
  -F language="ha" \\
  -F file="@kira.wav"`}</pre>
      <pre className="out">{`{
  "text": "Sannu, ina kwana?",
  "language": "ha",
  "audio_seconds": 2.4
}`}</pre>
    </div>
  );
}

/* After openai.com/api: hero, the models, guides, the platform, use cases, how it is built, get started.
   Nothing here says the API is live; every model carries its real status. */
export default async function Api({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang;
  const a = apiCopy[lang];
  const L = (p: string) => (p.startsWith("http") ? p : lp(lang, p));

  return (
    <div className="page-top api">
      <Reveal />

      <section className="wrap api-hero">
        <p className="api-status"><i aria-hidden="true" />{a.status}</p>
        <h1 className="api-display">{a.h1}</h1>
        <p className="lede">{a.lede}</p>
        <div className="acts">
          <a className="pill lg" href={TALK}>{a.talk}</a>
          <a className="pill lg dark" href={EARLY}>{a.access} <Icon name="arrow-long" size={18} stroke={1.6} /></a>
        </div>
        <ul className="api-strip">
          {a.strip.map((s, i) => <li key={s}><Icon name={stripIcons[i]} size={20} stroke={1.4} />{s}</li>)}
        </ul>
      </section>

      <section className="section" aria-labelledby="h-api-models">
        <div className="wrap">
          <h2 id="h-api-models" className="api-h2">{a.modelsH}</h2>
          <p className="api-sub">{a.modelsSub}</p>
          <div className="api-models">
            {a.models.map(m => (
              <a key={m.slug} className={`api-model reveal${m.slug === "air" ? " dark" : ""}`} href={L(m.href)}>
                <span className="art" aria-hidden="true">{modelArt[m.slug]}</span>
                <h3>{m.name}</h3>
                <dl>
                  <div><dt>{a.labels.task}</dt><dd>{m.task}</dd></div>
                  <div><dt>{a.labels.io}</dt><dd>{m.io}</dd></div>
                  <div><dt>{a.labels.languages}</dt><dd>{m.languages}</dd></div>
                  <div><dt>{a.labels.status}</dt><dd><i className={m.slug === "air" ? "research" : "dev"} aria-hidden="true" />{m.status}</dd></div>
                </dl>
                <span className="go">{a.learnMore} <Icon name={m.href.startsWith("http") ? "external" : "arrow-long"} size={16} stroke={1.6} /></span>
              </a>
            ))}
          </div>
          <p className="api-note">{a.pricingNote}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="h-api-guides">
        <div className="wrap">
          <h2 id="h-api-guides" className="api-h3">{a.guidesH}</h2>
          <div className="api-guides">
            {a.guides.map(g => (
              <a key={g.t} className="api-guide reveal" href={L(g.href)}>
                <h3 className="h3">{g.t}</h3>
                <p>{g.d}</p>
                <span className="textlink"><span>{g.cta}</span><Icon name="arrow-long" size={16} stroke={1.6} /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-api-platform">
        <div className="wrap">
          <h2 id="h-api-platform" className="api-h2">{a.platformH}</h2>
          <p className="api-sub">{a.platformSub}</p>
          <div className="acts api-acts">
            <a className="pill" href={L("/research")}>{a.readResearch}</a>
            <a className="pill dark" href={EARLY}>{a.access}</a>
          </div>
          <div className="api-pillars">
            <div className="api-pillar reveal">
              <div className="api-vis"><span className="art"><GlassArt motif="stack" palette="haze" ratio="square" place="centre" /></span><CodeWindow /></div>
              <h3 className="h3">{a.pillars[0].t}</h3>
              <p>{a.pillars[0].d}</p>
              <p className="api-note left">{a.codeNote}</p>
            </div>
            <div className="api-pillar reveal">
              <div className="api-vis"><span className="art"><GlassArt motif="blossom" palette="apricot" ratio="square" place="centre" /></span>
                <div className="api-speak" aria-hidden="true"><span className="tile"><Icon name="volume" size={34} stroke={1.4} /></span><span className="bars">{Array.from({ length: 21 }, (_, i) => <i key={i} style={{ height: `${18 + Math.round(30 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * .45)))}px` }} />)}</span></div>
              </div>
              <h3 className="h3">{a.pillars[1].t}</h3>
              <p>{a.pillars[1].d}</p>
            </div>
            <div className="api-pillar reveal">
              <div className="api-vis"><span className="art"><GlassArt motif="talk" palette="dusk" ratio="square" place="centre" /></span>
                <div className="api-tiles" aria-hidden="true">{["full-duplex", "translate", "phone-voice", "microphone", "headphones", "language"].map(i => <span key={i} className="tile"><Icon name={i} size={30} stroke={1.4} /></span>)}</div>
              </div>
              <h3 className="h3">{a.pillars[2].t}</h3>
              <p>{a.pillars[2].d}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-api-uses">
        <div className="wrap">
          <h2 id="h-api-uses" className="api-h2">{a.useH}</h2>
          <p className="api-sub">{a.useSub}</p>
          <div className="api-uses">
            {a.uses.map((u, i) => (
              <div key={u.t} className="api-use reveal">
                <div className="api-use-art"><span className="art"><GlassArt motif={useArt[i][0]} palette={useArt[i][1]} ratio="wide" seed={`use-${i}`} ch="ɗ" place="centre" /></span><span className="tile"><Icon name={u.icon} size={28} stroke={1.4} /></span></div>
                <h3 className="h3">{u.t}</h3>
                <p>{u.d}</p>
                <a className="textlink" href={mail(`Namu API: ${u.t}`)}><span>{a.useCta}</span><Icon name="arrow-long" size={16} stroke={1.6} /></a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-api-resp">
        <div className="wrap">
          <h2 id="h-api-resp" className="api-h2">{a.respH}</h2>
          <p className="api-sub">{a.respSub}</p>
          <div className="api-cols">
            {a.columns.map(col => (
              <div key={col.t} className="api-col reveal">
                <h3 className="h3">{col.t}</h3>
                <ul>{col.items.map(x => <li key={x}><Icon name="check" size={18} stroke={1.6} />{x}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section api-start" aria-labelledby="h-api-start">
        <div className="wrap">
          <h2 id="h-api-start" className="api-h2">{a.startH}</h2>
          <div className="api-start-grid">
            {[{ c: a.partner, href: TALK, dark: false }, { c: a.build, href: EARLY, dark: true }].map(({ c, href, dark }) => (
              <div key={c.t} className="api-start-card reveal">
                <h3>{c.t}</h3>
                <ul>{c.items.map(x => <li key={x}><Icon name="check" size={18} stroke={1.6} />{x}</li>)}</ul>
                <a className={`pill lg${dark ? " dark" : ""}`} href={href}>{c.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
