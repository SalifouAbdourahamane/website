import { HeroRing, GlassArt, NightArt, Blueprint } from "@/components/Art";
import { Icon } from "@/components/Icon";
import { Explorer, Rail, Reveal } from "@/components/Interactive";
import { NewsArt, ProgrammeArt, darkArt } from "@/components/NewsArt";
import { programmes } from "@/content/programmes";
import { models } from "@/content/site";
import { news, monthYear } from "@/content/news";

const featured = [
  { slug: "air", name: "Aïr", line: "A voice agent that holds a conversation in Hausa", href: "/models/air", listen: true },
  { slug: "hira", name: "Hira", line: "Research into speech models that listen while they speak", href: "/programmes/hira" },
  { slug: "rumbu", name: "Rumbu", line: "A consented Hausa speech commons, Niger first", href: "/programmes/rumbu" },
  { slug: "maauni", name: "Maʼauni", line: "Honest measurement for Hausa and Zarma speech", href: "/programmes/maauni" },
  { slug: "zarma", name: "Zarma", line: "Speech technology for Zarma, from the ground up", href: "/programmes/zarma" },
  { slug: "tankade", name: "Tankaɗe", line: "From raw audio to data a model and a reader can trust", href: "/programmes/tankade" },
];
const isHausa = (s: string) => /[ɓɗƙƴʼ]/.test(s);

export default function Home() {
  const [lead, ...rest] = news;
  return (
    <>
      <Reveal />
      <section className="hero" aria-labelledby="h-hero">
        <div className="haze" aria-hidden="true"><i className="b1" /><i className="b2" /><i className="b3" /><i className="b4" /><i className="b5" /><HeroRing /><span className="grain" /></div>
        <h1 id="h-hero" className="display rise">Speech AI for the languages of the Sahel</h1>
        <a className="pill lg frost cta rise d2" href="#featured">Learn more</a>
      </section>

      <section id="featured" className="section" aria-label="Featured">
        <div className="rail-wrap">
          <Rail label="Featured research and models">
            {featured.map(f => (
              <a key={f.slug} href={f.href} className={`fcard${darkArt.has(f.slug) ? " dark" : ""}`}>
                <div className="art"><ProgrammeArt slug={f.slug} /></div>
                <div className="txt"><h2 className="h3" lang={isHausa(f.name) ? "ha" : undefined}>{f.name}</h2><p>{f.line}</p></div>
                <div className="acts">
                  <span className={`pill ${darkArt.has(f.slug) ? "light" : "dark"}`}>Learn more</span>
                  {f.listen && <span className="pill frost"><Icon name="play" size={16} stroke={1.6} />Listen</span>}
                </div>
              </a>
            ))}
          </Rail>
        </div>
      </section>

      <section id="latest" className="section" aria-labelledby="h-latest">
        <div className="wrap">
          <div className="section-head"><h2 id="h-latest" className="h2">Latest news</h2><a className="pill" href="/research#latest">View news</a></div>
          <div className="news">
            <a className="news-feature reveal" href={lead.href}>
              <p className="h1"><span>{lead.title}</span></p>
              <div className="metarow"><span>{monthYear(lead.date)}</span><span>{lead.topic}</span><span className="go">Learn more <Icon name="chevron" size={16} stroke={1.6} className="rot-90" /></span></div>
              <div className="thumb"><NewsArt art={lead.art} /></div>
            </a>
            <ul className="news-list">
              {rest.map(n => (
                <li key={n.href} className="reveal">
                  <a href={n.href}>
                    <div><p className="t">{n.title}</p><div className="metarow"><span>{monthYear(n.date)}</span><span>{n.topic}</span><span className="go">{n.external ? "namu-ai.org" : "Learn more"} <Icon name={n.external ? "external" : "chevron"} size={16} stroke={1.6} className={n.external ? undefined : "rot-90"} /></span></div></div>
                    <div className="thumb"><NewsArt art={n.art} /></div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="models" className="section" aria-labelledby="h-models">
        <div className="wrap">
          <div className="section-head"><h2 id="h-models" className="h2">Models<span className="sub">Speech systems built on our research</span></h2><a className="pill" href="https://www.namu-ai.org">View on namu-ai.org</a></div>
          <div className="models">
            {models.map(m => (
              <div key={m.slug} className="model reveal">
                <div className="tile"><Icon name={m.icon} size={44} stroke={1.3} />{m.isNew && <span className="badge">Research</span>}</div>
                <h3 className="h3">{m.name}</h3>
                <p>{m.line}</p>
                <span className="overline">Status</span>
                <ul><li><span className={`dot${m.status === "In development" ? " dev" : ""}`} />{m.status}</li><li className="muted">{m.task} · {m.languages}</li></ul>
                <a className="textlink" href={m.href}><span>Learn more</span><Icon name="chevron" size={16} stroke={1.6} className="rot-90" /></a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="research" className="section" aria-labelledby="h-research">
        <div className="wrap">
          <div className="section-head"><h2 id="h-research" className="h2">Research<span className="sub">Five programmes, one aim: speech technology that works for the people of the Sahel</span></h2><a className="pill" href="/research">Explore research</a></div>
          <Explorer
            items={programmes.map(p => ({ title: p.name, note: p.status, body: p.sentence }))}
            stages={programmes.map(p => (
              <a key={p.slug} href={`/programmes/${p.slug}`} aria-label={`${p.name}: ${p.title}`}>
                <ProgrammeArt slug={p.slug} ratio="wide" />
                <span className={`pill ${darkArt.has(p.slug) ? "light" : "dark"}`}>Explore {p.name}</span>
              </a>
            ))}
          />
        </div>
      </section>

      <section id="data" className="section" aria-labelledby="h-data">
        <div className="wrap">
          <div className="section-head"><h2 id="h-data" className="h2">Data<span className="sub">Hausa as people speak it, recorded with their consent</span></h2><a className="pill" href="/data">How we work with data</a></div>
          <div className="datagrid">
            {[
              { art: <GlassArt motif="mic" palette="apricot" ratio="square" place="centre" />, t: "Conversation, not dictation", b: "Two people talking on separate channels, calls over ordinary phones, and speakers who do not read, prompted by pictures and questions instead of text." },
              { art: <NightArt seed="data-consent" ratio="square" />, t: "Consent that travels with the data", b: "Every speaker consents in Hausa, chooses what their voice may be used for, and is paid for their time. Those choices stay attached to every file and model." },
              { art: <GlassArt motif="stack" palette="sand" ratio="square" place="centre" />, t: "A data statement with every release", b: "Who is in the data, how it was recorded and what it cannot support, published with it. What we keep closed, we say why." },
              { art: <Blueprint kind="measure" ratio="square" />, t: "Test sets frozen first", b: "Speaker-disjoint evaluation sets, balanced by dialect and gender, frozen before any training data is collected." },
            ].map(d => (
              <div key={d.t} className="datum reveal"><div className="ic">{d.art}</div><div><h3 className="h3">{d.t}</h3><p>{d.b}</p></div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-join">
        <div className="wrap join">
          <div className="pic reveal"><GlassArt motif="talk" palette="dusk" ratio="square" place="centre" /></div>
          <div className="reveal">
            <h2 id="h-join" className="statement">Help build speech AI for the languages you speak</h2>
            <p>We work with native speakers, linguists, researchers and engineers in Niger, Nigeria and beyond. Hausa, Zarma or Fulfulde fluency counts.</p>
            <a className="pill lg dark" href="/about#careers">Work with us</a>
          </div>
        </div>
      </section>
    </>
  );
}
