"use client";

/* The home page console: try the Lab's models (after elevenlabs.io's hero panel and openai.fm).
   A design preview: nothing is connected, so playback, listening and translation are simulated with
   timed animation and the footer says so. Tabs follow the WAI-ARIA tabs pattern. */
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "./Icon";
import { conversation, playground, scripts, translation, voices, type Voice } from "@/content/playground";
import { createListeningField } from "@/lib/field";
import { lp, type Lang } from "@/i18n/config";

type Tab = "speak" | "listen" | "translate" | "converse" | "api";
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* A loudness envelope with the rhythm of speech: syllables about 190 ms apart, gathered into words. */
const envelope = (t: number) => {
  const syllable = Math.max(0, Math.sin(t * Math.PI * 2 * 5.2)) ** .6;
  const phrase = .55 + .45 * Math.abs(Math.sin(t * 2.1) * Math.sin(t * .7 + 1));
  return Math.min(1, syllable * phrase * (.86 + .14 * Math.sin(t * 37.1)));
};

/* Runs `tick(elapsedMs)` every frame while `on`; stops when tick returns false. */
function useTicker(on: boolean, tick: (ms: number) => boolean | void) {
  const ref = useRef(tick); ref.current = tick;
  useEffect(() => {
    if (!on) return;
    let raf = 0; const t0 = performance.now();
    const step = (now: number) => { if (ref.current(now - t0) === false) return; raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [on]);
}

/* A glowing voice orb: a slowly turning swirl of the voice's colours under a glass highlight and grain. */
function Orb({ v, size, amp = 0, className = "", children }: { v: Pick<Voice, "palette">; size: number; amp?: number; className?: string; children?: ReactNode }) {
  const [c1, c2, c3] = v.palette;
  return (
    <span className={`orb ${className}`} style={{ width: size, ["--c1" as string]: c1, ["--c2" as string]: c2, ["--c3" as string]: c3, ["--amp" as string]: amp.toFixed(3) } as CSSProperties}>
      <span className="swirl" aria-hidden="true" /><span className="gloss" aria-hidden="true" />
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- Speak (Tafiya) */
function Speak({ lang }: { lang: Lang }) {
  const t = playground[lang].speak, ss = scripts[lang], vs = voices[lang];
  const [sid, setSid] = useState(ss[0].id);
  const [text, setText] = useState(ss[0].text);
  const [vi, setVi] = useState(0);
  const [dialect, setDialect] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);          // words spoken, fractional
  const [amp, setAmp] = useState(0);
  const words = text.trim().split(/\s+/);
  const perWord = 340;
  const script = ss.find(s => s.id === sid);
  const unchanged = script?.text === text;

  useTicker(playing, ms => {
    const p = ms / perWord;
    if (p >= words.length + .6) { setPlaying(false); setAmp(0); setPos(0); return false; }
    setPos(p); setAmp(reduced() ? 0 : envelope(ms / 1000));
  });
  const pick = (id: string) => { const s = ss.find(x => x.id === id)!; setSid(id); setText(s.text); setPlaying(false); setPos(0); };
  const turn = (d: number) => { setVi(i => (i + d + vs.length) % vs.length); };
  const v = vs[vi], prev = vs[(vi - 1 + vs.length) % vs.length], next = vs[(vi + 1) % vs.length];
  const progress = playing ? Math.min(1, pos / words.length) : 0;

  return (
    <div className="pg-speak">
      <div className="pg-card pg-script">
        <div className="pg-head">
          <span className="pg-label">{t.script}</span>
          <div className="pg-chips" role="group" aria-label={t.script}>
            {ss.map(s => <button key={s.id} type="button" aria-pressed={s.id === sid} onClick={() => pick(s.id)}>{s.label}</button>)}
          </div>
        </div>
        {playing ? (
          <p className="pg-text pg-read" lang="ha" aria-live="off">
            {words.map((w, i) => <span key={i} className={i < Math.floor(pos) ? "said" : i === Math.floor(pos) ? "now" : undefined}>{w} </span>)}
          </p>
        ) : (
          <textarea className="pg-text" lang="ha" value={text} maxLength={240} spellCheck={false} aria-label={t.script}
            onChange={e => { setText(e.target.value); }} />
        )}
        <p className="pg-gloss">{unchanged ? script?.gloss : " "}</p>
        <div className="pg-foot">
          <span>{t.chars(text.length)}</span>
          <div className="pg-seg" role="group" aria-label={t.region}>
            {t.dialects.map((d, i) => <button key={d} type="button" aria-pressed={i === dialect} onClick={() => setDialect(i)}>{d}</button>)}
          </div>
        </div>
      </div>

      <div className="pg-voices">
        <span className="pg-label">{t.voices}</span>
        <div className="pg-carousel">
          <button type="button" className="pg-arrow" aria-label="Previous voice" onClick={() => turn(-1)}><Icon name="chevron" size={18} stroke={1.6} className="rot90" /></button>
          <button type="button" className="pg-side" aria-label={prev.name} onClick={() => turn(-1)}><Orb v={prev} size={92} /></button>
          <div className="pg-main">
            <svg className="pg-ring" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="56" pathLength={1} className="track" />
              <circle cx="60" cy="60" r="56" pathLength={1} className="fill" style={{ strokeDashoffset: 1 - progress }} />
            </svg>
            <Orb v={v} size={196} amp={amp} className={playing ? "live" : ""}>
              <button type="button" className="pg-play" aria-label={playing ? t.stop : `${t.play}: ${v.name}`} onClick={() => { setPos(0); setPlaying(p => !p); }}>
                <Icon name={playing ? "pause" : "play"} size={22} stroke={1.8} />
              </button>
            </Orb>
          </div>
          <button type="button" className="pg-side" aria-label={next.name} onClick={() => turn(1)}><Orb v={next} size={92} /></button>
          <button type="button" className="pg-arrow" aria-label="Next voice" onClick={() => turn(1)}><Icon name="chevron" size={18} stroke={1.6} className="rot-90" /></button>
        </div>
        <p className="pg-voice"><b>{v.name}</b><span>{playing ? `${t.speaking}…` : v.note}</span></p>
        <button type="button" className="pg-big" onClick={() => { setPos(0); setPlaying(p => !p); }}>
          <Icon name={playing ? "stop" : "play"} size={20} stroke={1.8} />{playing ? t.stop : t.play}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Listen (Tatsuniya) */
function Listen({ lang }: { lang: Lang }) {
  const t = playground[lang].listen;
  const [state, setState] = useState<"idle" | "listening" | "done">("idle");
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<ReturnType<typeof createListeningField> | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    field.current = createListeningField(canvas.current, { autoplay: false, attention: false, seed: 11, speed: .32, bands: 22, fieldTop: .18, now: .86 });
    field.current.pause();
    return () => field.current?.pause();
  }, []);
  useEffect(() => { if (state === "listening") field.current?.play(); else field.current?.pause(); }, [state]);
  useTicker(state === "listening", ms => { if (ms > 4800) { setState("done"); return false; } });
  const toggle = () => setState(s => (s === "listening" ? "done" : "listening"));

  return (
    <div className="pg-listen">
      <div className="pg-card pg-mic-card">
        <canvas ref={canvas} className="pg-field" aria-hidden="true" />
        <button type="button" className={`pg-mic ${state}`} aria-pressed={state === "listening"} onClick={toggle}>
          <i aria-hidden="true" /><i aria-hidden="true" /><Icon name={state === "listening" ? "stop" : "microphone"} size={30} stroke={1.5} />
          <span className="sr-only">{state === "listening" ? t.listening : t.tap}</span>
        </button>
        <p className="pg-mic-label">{state === "idle" ? t.tap : state === "listening" ? t.listening : t.done}</p>
        <p className="pg-hint">{t.hint}</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Translate (Kora) */
function Translate({ lang }: { lang: Lang }) {
  const t = playground[lang].translate;
  const [flip, setFlip] = useState(false);
  const [running, setRunning] = useState(false);
  const [typed, setTyped] = useState(0);
  const src = flip ? translation.fr : translation.ha, dst = flip ? translation.ha : translation.fr;
  const names = flip ? [t.to, t.from] : [t.from, t.to];
  useTicker(running, ms => { const k = Math.min(dst.length, Math.floor(ms / 28)); setTyped(k); if (k >= dst.length) { setRunning(false); return false; } });
  const run = () => { setTyped(0); setRunning(true); };

  return (
    <div className="pg-translate">
      <div className="pg-card pg-pane">
        <div className="pg-head"><span className="pg-lang">{names[0]}</span><span className="pg-icons"><Icon name="microphone" size={18} stroke={1.5} /><Icon name="volume" size={18} stroke={1.5} /></span></div>
        <p className="pg-text pg-src" lang={flip ? "fr" : "ha"}>{src}</p>
      </div>
      <button type="button" className="pg-swap" aria-label={t.swap} onClick={() => { setFlip(f => !f); setTyped(0); setRunning(false); }}><Icon name="full-duplex" size={20} stroke={1.5} /></button>
      <div className="pg-card pg-pane out">
        <div className="pg-head"><span className="pg-lang">{names[1]}</span><button type="button" className="pg-listen-btn" disabled={typed < dst.length}><Icon name="volume" size={18} stroke={1.5} />{t.listen}</button></div>
        <p className="pg-text" lang={flip ? "ha" : "fr"}>{dst.slice(0, typed)}{running && <span className="caret" aria-hidden="true" />}</p>
      </div>
      <div className="pg-translate-go"><button type="button" className="pg-big" onClick={run}><Icon name="translate" size={20} stroke={1.6} />{t.run}</button></div>
    </div>
  );
}

/* ---------------------------------------------------------------- Converse (Aïr) */
function Converse({ lang }: { lang: Lang }) {
  const t = playground[lang].converse, lines = conversation[lang];
  const [state, setState] = useState<"idle" | "connecting" | "live">("idle");
  const [shown, setShown] = useState(0);
  const [amp, setAmp] = useState(0);
  const per = 2600;
  useTicker(state !== "idle", ms => {
    if (state === "connecting") { if (ms > 900) setState("live"); return; }
    const k = Math.min(lines.length, Math.floor(ms / per) + 1);
    setShown(k);
    const speaker = lines[k - 1]?.who;
    const local = (ms % per) / per;
    const talking = local < .78;
    setAmp(reduced() ? 0 : talking ? envelope(ms / 1000) * (speaker === "air" ? 1 : .45) : 0);
    if (ms > per * lines.length + 400) { setAmp(0); return false; }
  });
  useEffect(() => { if (state === "idle") { setShown(0); setAmp(0); } }, [state]);
  const airVoice: Pick<Voice, "palette"> = { palette: ["#e8935a", "#7a4325", "#1c1410"] };
  const last = state === "idle" ? lines.slice(0, 2) : lines.slice(Math.max(0, shown - 2), shown);   // idle: a faded preview

  return (
    <div className="pg-converse">
      <div className="pg-stage">
        <div className={`pg-orb-wrap${state === "live" ? " live" : ""}`}>
          <i aria-hidden="true" /><i aria-hidden="true" />
          <Orb v={airVoice} size={240} amp={amp} className={`dark${state === "live" ? " live" : ""}`} />
        </div>
        <button type="button" className={`pg-call${state !== "idle" ? " on" : ""}`} aria-label={state === "idle" ? t.start : t.end} onClick={() => setState(s => (s === "idle" ? "connecting" : "idle"))}>
          <Icon name={state === "idle" ? "phone-voice" : "close"} size={22} stroke={1.6} />
        </button>
        <p className="pg-call-label">{state === "idle" ? t.start : state === "connecting" ? t.connecting : t.status}</p>
      </div>
      <ol className={`pg-captions${state === "idle" ? " idle" : ""}`} aria-live="polite">
        {last.map((l, i) => (
          <li key={`${shown}-${i}`} className={l.who}>
            <span className="who">{l.who === "air" ? t.air : t.you}</span>
            <span className="said" lang="ha">{l.text}</span>
            <span className="gl">{l.gloss}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------------------------------------------------------- API */
const CODE: Record<string, ReactNode> = {
  Python: <>
    <span className="k">from</span> namu <span className="k">import</span> Namu{"\n\n"}client = Namu(){"\n"}audio = client.speech.create({"\n"}
    {"    "}model=<span className="s">&quot;tafiya&quot;</span>,{"\n"}{"    "}voice=<span className="s">&quot;warm&quot;</span>,{"\n"}    {"    "}text=<span className="s hl" lang="ha">&quot;Barka da safiya! Ga labaran yau.&quot;</span>,{"\n"}){"\n"}audio.save(<span className="s">&quot;labarai.wav&quot;</span>)
  </>,
  JavaScript: <>
    <span className="k">import</span> Namu <span className="k">from</span> <span className="s">&quot;namu&quot;</span>;{"\n\n"}<span className="k">const</span> client = <span className="k">new</span> Namu();{"\n"}
    <span className="k">const</span> audio = <span className="k">await</span> client.speech.create({"{"}{"\n"}{"  "}model: <span className="s">&quot;tafiya&quot;</span>,{"\n"}{"  "}voice: <span className="s">&quot;warm&quot;</span>,{"\n"}
    {"  "}text: <span className="s hl" lang="ha">&quot;Barka da safiya! Ga labaran yau.&quot;</span>,{"\n"}{"}"});
  </>,
  cURL: <>
    curl api.namu-ai.org/v1/speech \{"\n"}{"  "}-H <span className="s">&quot;Authorization: Bearer $NAMU_API_KEY&quot;</span> \{"\n"}{"  "}-d <span className="s">{"'{"}&quot;model&quot;: &quot;tafiya&quot;, &quot;voice&quot;: &quot;warm&quot;,</span>{"\n"}
    {"       "}<span className="s">&quot;text&quot;: </span><span className="s hl" lang="ha">&quot;Barka da safiya! Ga labaran yau.&quot;</span><span className="s">{"}'"}</span> \{"\n"}{"  "}-o labarai.wav
  </>,
};
function Api({ lang }: { lang: Lang }) {
  const t = playground[lang].api;
  const [tab, setTab] = useState("Python");
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  useTicker(state === "running", ms => { if (ms > 1100) { setState("done"); return false; } });
  return (
    <div className="pg-api">
      <div className="pg-code">
        <div className="pg-code-head">
          <div className="pg-seg" role="group" aria-label="Language">
            {Object.keys(CODE).map(k => <button key={k} type="button" aria-pressed={k === tab} onClick={() => { setTab(k); setState("idle"); }}>{k}</button>)}
          </div>
          <button type="button" className="pg-run" onClick={() => setState("running")} disabled={state === "running"}>
            <Icon name="play" size={16} stroke={1.8} />{state === "running" ? t.running : t.run}
          </button>
        </div>
        <pre>{CODE[tab]}</pre>
        <div className={`pg-out ${state}`} aria-live="polite">
          <span className="pg-label">{t.output}</span>
          {state === "idle" ? <span className="muted">—</span> : state === "running" ? <span className="muted">{t.running}</span> : (
            <span className="pg-file"><Icon name="waveform" size={18} stroke={1.5} />labarai.wav<span className="bars" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ height: `${6 + Math.round(16 * Math.abs(Math.sin(i * 1.3) * Math.cos(i * .4)))}px` }} />)}</span><span className="muted">2.6 s</span></span>
          )}
        </div>
      </div>
      <p className="pg-note">{t.illustrative}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- the console */
export function Playground({ lang }: { lang: Lang }) {
  const c = playground[lang];
  const [tab, setTab] = useState<Tab>("speak");
  const ids = c.tabs.map(x => x.id as Tab);
  const onKey = (e: KeyboardEvent) => {
    const i = ids.indexOf(tab);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = ids[(i + (e.key === "ArrowRight" ? 1 : ids.length - 1)) % ids.length];
      setTab(next); document.getElementById(`pg-tab-${next}`)?.focus();
    }
  };
  return (
    <div className="pg">
      <div className="pg-haze" aria-hidden="true"><i className="b1" /><i className="b2" /><i className="b3" /><span className="grain" /></div>
      <div className="pg-tabs" role="tablist" aria-label="Try the Lab’s models" onKeyDown={onKey}>
        {c.tabs.map(x => (
          <button key={x.id} id={`pg-tab-${x.id}`} type="button" role="tab" aria-selected={tab === x.id} aria-controls={`pg-panel-${x.id}`} tabIndex={tab === x.id ? 0 : -1} onClick={() => setTab(x.id as Tab)}>
            {x.label}<small>{x.model}</small>
          </button>
        ))}
      </div>
      <div id={`pg-panel-${tab}`} className="pg-panel" role="tabpanel" aria-labelledby={`pg-tab-${tab}`} key={tab}>
        {tab === "speak" && <Speak lang={lang} />}
        {tab === "listen" && <Listen lang={lang} />}
        {tab === "translate" && <Translate lang={lang} />}
        {tab === "converse" && <Converse lang={lang} />}
        {tab === "api" && <Api lang={lang} />}
      </div>
      <div className="pg-footer">
        <span><i aria-hidden="true" />{c.preview}</span>
        <a href={lp(lang, "/api")}>{c.earlyAccess}<Icon name="arrow-long" size={16} stroke={1.6} /></a>
      </div>
    </div>
  );
}
