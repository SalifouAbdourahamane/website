"use client";

/* The home page console: try the Lab's models (after elevenlabs.io's hero panel and openai.fm).
   Speak, Listen, Translate and the API tab are live: the browser calls /api/demo/*, which adds the server-held
   demo key; the gateway caps the demo at 15 s of audio and 300 characters per request, and limits each visitor.
   Converse stays a scripted preview while Aïr is in research. Tabs follow the WAI-ARIA tabs pattern. */
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "./Icon";
import { conversation, playground, scripts, translation, voices, type PlaygroundCopy, type Voice } from "@/content/playground";
import { createListeningField } from "@/lib/field";
import { lp, type Lang } from "@/i18n/config";
import { apiBase } from "@/lib/supabase/env";

type Tab = "speak" | "listen" | "translate" | "converse" | "api";
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const DEMO_SECONDS = 14.5;   // the gateway refuses demo audio over 15 s

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

/* ---------------------------------------------------------------- talking to the demo */
class DemoError extends Error {}
function demoMessage(e: unknown, t: PlaygroundCopy["errors"]): string {
  const status = e instanceof DemoError ? Number(e.message) : 0;
  if (status === 429) return t.limited;
  if (status === 413) return t.tooLong;
  if (status === 503 || status === 404) return t.unavailable;
  return t.failed;
}
async function demo(model: "speech" | "transcribe" | "translate", body: Blob | object, query = ""): Promise<Response> {
  const isAudio = body instanceof Blob;
  const res = await fetch(`/api/demo/${model}${query}`, {
    method: "POST",
    headers: { "Content-Type": isAudio ? (body.type || "application/octet-stream") : "application/json" },
    body: isAudio ? body : JSON.stringify(body),
  });
  if (!res.ok) throw new DemoError(String(res.status));
  return res;
}
const b64wav = (b64: string) => new Blob([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], { type: "audio/wav" });

/* One microphone take, stopped by the caller or at the demo's length limit. */
function useRecorder(onDone: (audio: Blob) => void, onDenied: () => void) {
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const done = useRef(onDone); done.current = onDone;
  const stop = () => { if (timer.current) clearTimeout(timer.current); if (rec.current?.state === "recording") rec.current.stop(); };
  const start = async () => {
    let stream: MediaStream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } }); }
    catch { onDenied(); return false; }
    const r = new MediaRecorder(stream);
    const parts: BlobPart[] = [];
    r.ondataavailable = e => { if (e.data.size) parts.push(e.data); };
    r.onstop = () => { stream.getTracks().forEach(x => x.stop()); done.current(new Blob(parts, { type: r.mimeType || "audio/webm" })); };
    rec.current = r; r.start();
    timer.current = setTimeout(stop, DEMO_SECONDS * 1000);
    return true;
  };
  useEffect(() => () => stop(), []);
  return { start, stop };
}

/* Plays a clip and reports its loudness each frame, so the orb moves with the real voice. */
function usePlayer() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const buf = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const url = useRef<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [amp, setAmp] = useState(0);
  const ensure = () => {
    if (audio.current) return audio.current;
    const a = new Audio();
    a.onended = a.onpause = () => { setPlaying(false); setAmp(0); };
    a.onplay = () => setPlaying(true);
    try {
      const ctx = new AudioContext();
      const node = ctx.createAnalyser(); node.fftSize = 512;
      ctx.createMediaElementSource(a).connect(node); node.connect(ctx.destination);
      analyser.current = node;
      a.addEventListener("play", () => { void ctx.resume(); });
    } catch { /* no Web Audio: the orb stays still, the sound still plays */ }
    audio.current = a;
    return a;
  };
  useTicker(playing, () => {
    const a = audio.current;
    if (!a) return false;
    setProgress(a.duration ? a.currentTime / a.duration : 0);
    const node = analyser.current;
    if (node && !reduced()) {
      buf.current ??= new Uint8Array(new ArrayBuffer(node.fftSize));
      node.getByteTimeDomainData(buf.current);
      let sum = 0; for (const v of buf.current) sum += ((v - 128) / 128) ** 2;
      setAmp(Math.min(1, Math.sqrt(sum / buf.current.length) * 4));
    }
  });
  const play = (blob: Blob) => {
    const a = ensure();
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = URL.createObjectURL(blob);
    a.src = url.current; setProgress(0);
    void a.play();
  };
  const stop = () => { audio.current?.pause(); setProgress(0); };
  useEffect(() => () => { audio.current?.pause(); if (url.current) URL.revokeObjectURL(url.current); }, []);
  return { play, stop, playing, progress, amp };
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
  const c = playground[lang], t = c.speak, ss = scripts[lang], vs = voices[lang];
  const [sid, setSid] = useState(ss[0].id);
  const [text, setText] = useState(ss[0].text);
  const [vi, setVi] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef(new Map<string, Blob>());
  const player = usePlayer();
  const words = text.trim().split(/\s+/);
  const script = ss.find(s => s.id === sid);
  const unchanged = script?.text === text;
  const v = vs[vi], other = vs[(vi + 1) % vs.length];
  const pos = player.progress * words.length;

  const pick = (id: string) => { const s = ss.find(x => x.id === id)!; setSid(id); setText(s.text); player.stop(); };
  const turn = () => { player.stop(); setVi(i => (i + 1) % vs.length); };
  async function toggle() {
    if (player.playing) { player.stop(); return; }
    const k = `${v.id}\n${text.trim()}`;
    setError(null);
    let clip = cache.current.get(k);
    if (!clip) {
      setLoading(true);
      try { clip = await (await demo("speech", { text: text.trim(), voice: v.id })).blob(); cache.current.set(k, clip); }
      catch (e) { setError(demoMessage(e, c.errors)); return; }
      finally { setLoading(false); }
    }
    player.play(clip);
  }

  return (
    <div className="pg-speak">
      <div className="pg-card pg-script">
        <div className="pg-head">
          <span className="pg-label">{t.script}</span>
          <div className="pg-chips" role="group" aria-label={t.script}>
            {ss.map(s => <button key={s.id} type="button" aria-pressed={s.id === sid} onClick={() => pick(s.id)}>{s.label}</button>)}
          </div>
        </div>
        {player.playing ? (
          <p className="pg-text pg-read" lang="ha" aria-live="off">
            {words.map((w, i) => <span key={i} className={i < Math.floor(pos) ? "said" : i === Math.floor(pos) ? "now" : undefined}>{w} </span>)}
          </p>
        ) : (
          <textarea className="pg-text" lang="ha" value={text} maxLength={240} spellCheck={false} aria-label={t.script}
            onChange={e => { setText(e.target.value); }} />
        )}
        <p className="pg-gloss">{unchanged ? script?.gloss : " "}</p>
        <div className="pg-foot"><span>{t.chars(text.length)}</span></div>
      </div>

      <div className="pg-voices">
        <span className="pg-label">{t.voices}</span>
        <div className="pg-carousel">
          <button type="button" className="pg-arrow" aria-label="Previous voice" onClick={turn}><Icon name="chevron" size={18} stroke={1.6} className="rot90" /></button>
          <button type="button" className="pg-side" aria-label={other.name} onClick={turn}><Orb v={other} size={92} /></button>
          <div className="pg-main">
            <svg className="pg-ring" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="56" pathLength={1} className="track" />
              <circle cx="60" cy="60" r="56" pathLength={1} className="fill" style={{ strokeDashoffset: 1 - (player.playing ? player.progress : 0) }} />
            </svg>
            <Orb v={v} size={196} amp={player.amp} className={player.playing || loading ? "live" : ""}>
              <button type="button" className="pg-play" aria-label={player.playing ? t.stop : `${t.play}: ${v.name}`} onClick={toggle} disabled={loading || !text.trim()}>
                <Icon name={player.playing ? "pause" : "play"} size={22} stroke={1.8} />
              </button>
            </Orb>
          </div>
          <button type="button" className="pg-side" aria-label={other.name} onClick={turn}><Orb v={other} size={92} /></button>
          <button type="button" className="pg-arrow" aria-label="Next voice" onClick={turn}><Icon name="chevron" size={18} stroke={1.6} className="rot-90" /></button>
        </div>
        <p className="pg-voice"><b>{v.name}</b><span>{loading ? c.live.working : player.playing ? `${t.speaking}…` : v.note}</span></p>
        <button type="button" className="pg-big" onClick={toggle} disabled={loading || !text.trim()}>
          <Icon name={player.playing ? "stop" : "play"} size={20} stroke={1.8} />{loading ? c.live.working : player.playing ? t.stop : t.play}
        </button>
        {error && <p className="pg-error" role="alert">{error}</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Listen (Tatsuniya) */
function Listen({ lang }: { lang: Lang }) {
  const c = playground[lang], t = c.listen;
  const [state, setState] = useState<"idle" | "listening" | "working" | "done">("idle");
  const [heard, setHeard] = useState("");
  const [error, setError] = useState<string | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<ReturnType<typeof createListeningField> | null>(null);
  const rec = useRecorder(async audio => {
    setState("working");
    try { setHeard(((await (await demo("transcribe", audio)).json()) as { text?: string }).text?.trim() || "…"); setState("done"); }
    catch (e) { setError(demoMessage(e, c.errors)); setState("idle"); }
  }, () => { setError(c.errors.micDenied); setState("idle"); });

  useEffect(() => {
    if (!canvas.current) return;
    field.current = createListeningField(canvas.current, { autoplay: false, attention: false, seed: 11, speed: .32, bands: 22, fieldTop: .18, now: .86 });
    field.current.pause();
    return () => field.current?.pause();
  }, []);
  useEffect(() => { if (state === "listening" || state === "working") field.current?.play(); else field.current?.pause(); }, [state]);
  async function toggle() {
    if (state === "listening") { rec.stop(); return; }
    if (state === "working") return;
    setError(null); setHeard("");
    if (await rec.start()) setState("listening");
  }
  const label = state === "idle" ? t.tap : state === "listening" ? c.live.recording : state === "working" ? c.live.working : t.done;

  return (
    <div className="pg-listen">
      <div className="pg-card pg-mic-card">
        <canvas ref={canvas} className="pg-field" aria-hidden="true" />
        <button type="button" className={`pg-mic ${state === "working" ? "listening" : state}`} aria-pressed={state === "listening"} onClick={toggle} disabled={state === "working"}>
          <i aria-hidden="true" /><i aria-hidden="true" /><Icon name={state === "listening" ? "stop" : "microphone"} size={30} stroke={1.5} />
          <span className="sr-only">{label}</span>
        </button>
        <p className="pg-mic-label" aria-live="polite">{label}</p>
        {heard ? (
          <p className="pg-result" aria-live="polite"><span className="pg-label">{t.transcript}</span><span className="said" lang="ha">{heard}</span></p>
        ) : <p className="pg-hint">{t.hint}</p>}
        {error && <p className="pg-error" role="alert">{error}</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Translate (Kora) */
function Translate({ lang }: { lang: Lang }) {
  const c = playground[lang], t = c.translate;
  const [flip, setFlip] = useState(false);              // false: Hausa → French
  const [state, setState] = useState<"idle" | "listening" | "working" | "done">("idle");
  const [out, setOut] = useState<{ src: string; dst: string; audio: Blob | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const player = usePlayer();
  const rec = useRecorder(async audio => {
    setState("working");
    try {
      const j = await (await demo("translate", audio, `?target=${flip ? "ha" : "fr"}`)).json() as { source_text?: string; text?: string; audio?: string };
      setOut({ src: j.source_text ?? "", dst: j.text ?? "", audio: j.audio ? b64wav(j.audio) : null }); setState("done");
    } catch (e) { setError(demoMessage(e, c.errors)); setState("idle"); }
  }, () => { setError(c.errors.micDenied); setState("idle"); });

  const names = flip ? [t.to, t.from] : [t.from, t.to];
  const sample = flip ? translation.fr : translation.ha, sampleOut = flip ? translation.ha : translation.fr;
  async function toggle() {
    if (state === "listening") { rec.stop(); return; }
    if (state === "working") return;
    setError(null); setOut(null); player.stop();
    if (await rec.start()) setState("listening");
  }
  const label = state === "listening" ? c.live.recording : state === "working" ? c.live.working : state === "done" ? c.live.again : c.live.record;

  return (
    <div className="pg-translate">
      <div className="pg-card pg-pane">
        <div className="pg-head"><span className="pg-lang">{names[0]}</span><span className="pg-icons"><Icon name="microphone" size={18} stroke={1.5} /></span></div>
        <p className={`pg-text pg-src${out ? "" : " muted"}`} lang={flip ? "fr" : "ha"}>{out ? out.src : sample}</p>
      </div>
      <button type="button" className="pg-swap" aria-label={t.swap} onClick={() => { setFlip(f => !f); setOut(null); setState("idle"); player.stop(); }} disabled={state === "listening" || state === "working"}><Icon name="full-duplex" size={20} stroke={1.5} /></button>
      <div className="pg-card pg-pane out">
        <div className="pg-head"><span className="pg-lang">{names[1]}</span>
          <button type="button" className="pg-listen-btn" disabled={!out?.audio} onClick={() => out?.audio && player.play(out.audio)}><Icon name="volume" size={18} stroke={1.5} />{t.listen}</button>
        </div>
        <p className={`pg-text${out ? "" : " muted"}`} lang={flip ? "ha" : "fr"} aria-live="polite">{out ? out.dst : state === "working" ? <span className="caret" aria-hidden="true" /> : sampleOut}</p>
      </div>
      <div className="pg-translate-go">
        <button type="button" className="pg-big" onClick={toggle} disabled={state === "working"}>
          <Icon name={state === "listening" ? "stop" : "microphone"} size={20} stroke={1.6} />{label}
        </button>
        {error && <p className="pg-error" role="alert">{error}</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Converse (Aïr): a scripted preview */
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
      <p className="pg-note">{playground[lang].converseNote}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- API: real requests, run on the demo */
const SAMPLE = "Barka da safiya! Ga labaran yau.";
const host = apiBase.replace(/^https?:\/\//, "");
const CODE: Record<string, ReactNode> = {
  Python: <>
    <span className="k">import</span> os, requests{"\n\n"}r = requests.post({"\n"}{"    "}<span className="s">&quot;https://{host}/v1/speech&quot;</span>,{"\n"}
    {"    "}headers={"{"}<span className="s">&quot;Authorization&quot;</span>: <span className="s">f&quot;Bearer {"{"}os.environ[&apos;NAMU_API_KEY&apos;]{"}"}&quot;</span>{"}"},{"\n"}
    {"    "}json={"{"}<span className="s">&quot;voice&quot;</span>: <span className="s">&quot;nadia&quot;</span>, <span className="s">&quot;text&quot;</span>: <span className="s hl" lang="ha">&quot;{SAMPLE}&quot;</span>{"}"},{"\n"}){"\n"}
    open(<span className="s">&quot;labarai.wav&quot;</span>, <span className="s">&quot;wb&quot;</span>).write(r.content)
  </>,
  JavaScript: <>
    <span className="k">const</span> r = <span className="k">await</span> fetch(<span className="s">&quot;https://{host}/v1/speech&quot;</span>, {"{"}{"\n"}{"  "}method: <span className="s">&quot;POST&quot;</span>,{"\n"}
    {"  "}headers: {"{"} Authorization: <span className="s">`Bearer ${"{"}process.env.NAMU_API_KEY{"}"}`</span>, <span className="s">&quot;Content-Type&quot;</span>: <span className="s">&quot;application/json&quot;</span> {"}"},{"\n"}
    {"  "}body: JSON.stringify({"{"} voice: <span className="s">&quot;nadia&quot;</span>, text: <span className="s hl" lang="ha">&quot;{SAMPLE}&quot;</span> {"}"}),{"\n"}{"}"});{"\n"}
    <span className="k">const</span> wav = <span className="k">await</span> r.arrayBuffer();
  </>,
  cURL: <>
    curl https://{host}/v1/speech \{"\n"}{"  "}-H <span className="s">&quot;Authorization: Bearer $NAMU_API_KEY&quot;</span> \{"\n"}{"  "}-H <span className="s">&quot;Content-Type: application/json&quot;</span> \{"\n"}
    {"  "}-d <span className="s">{"'{"}&quot;voice&quot;: &quot;nadia&quot;, &quot;text&quot;: </span><span className="s hl" lang="ha">&quot;{SAMPLE}&quot;</span><span className="s">{"}'"}</span> \{"\n"}{"  "}-o labarai.wav
  </>,
};
function Api({ lang }: { lang: Lang }) {
  const c = playground[lang], t = c.api;
  const [tab, setTab] = useState("Python");
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [clip, setClip] = useState<{ blob: Blob; seconds: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const player = usePlayer();
  async function run() {
    setState("running"); setError(null);
    try {
      const res = await demo("speech", { text: SAMPLE, voice: "nadia" });
      const blob = await res.blob();
      setClip({ blob, seconds: res.headers.get("x-audio-seconds") ?? "" }); setState("done"); player.play(blob);
    } catch (e) { setError(demoMessage(e, c.errors)); setState("idle"); }
  }
  return (
    <div className="pg-api">
      <div className="pg-code">
        <div className="pg-code-head">
          <div className="pg-seg" role="group" aria-label="Language">
            {Object.keys(CODE).map(k => <button key={k} type="button" aria-pressed={k === tab} onClick={() => setTab(k)}>{k}</button>)}
          </div>
          <button type="button" className="pg-run" onClick={run} disabled={state === "running"}>
            <Icon name="play" size={16} stroke={1.8} />{state === "running" ? t.running : t.run}
          </button>
        </div>
        <pre>{CODE[tab]}</pre>
        <div className={`pg-out ${state}`} aria-live="polite">
          <span className="pg-label">{t.output}</span>
          {error ? <span className="pg-error">{error}</span> : state === "idle" ? <span className="muted">—</span> : state === "running" ? <span className="muted">{t.running}</span> : clip && (
            <button type="button" className="pg-file pg-listen-btn" onClick={() => player.play(clip.blob)}>
              <Icon name="waveform" size={18} stroke={1.5} />labarai.wav
              <span className="bars" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ height: `${6 + Math.round(16 * Math.abs(Math.sin(i * 1.3) * Math.cos(i * .4)))}px` }} />)}</span>
              {clip.seconds && <span className="muted">{Number(clip.seconds).toFixed(1)} s</span>}
            </button>
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
        <a href={lp(lang, "/account/keys")}>{c.earlyAccess}<Icon name="arrow-long" size={16} stroke={1.6} /></a>
      </div>
    </div>
  );
}
