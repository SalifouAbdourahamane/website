"use client";

/* The /api hero studio: pick a model, see the request, watch the response arrive (after elevenlabs.io/api's
   hero demo and deepgram.com). A design preview: nothing is called, and the footer says so. It moves on to
   the next model by itself until the visitor picks one; with reduced motion it stays put. */
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import type { ApiCopy } from "@/content/api";

const HOST = "https://api.namu-ai.org";
const AUTH = <>{"  "}-H <s>&quot;Authorization: Bearer $NAMU_API_KEY&quot;</s> \{"\n"}</>;

/* HA-REVIEW: the sample sentences below were written for this preview. */
const REQUEST: Record<string, ReactNode> = {
  tatsuniya: <><b>curl</b> {HOST}/v1/transcribe \{"\n"}{AUTH}{"  "}-F <s>model=&quot;tatsuniya&quot;</s> \{"\n"}{"  "}-F <s>file=&quot;@kira.wav&quot;</s></>,
  tafiya: <><b>curl</b> {HOST}/v1/speech \{"\n"}{AUTH}{"  "}-d <s>{"'{"}&quot;model&quot;: &quot;tafiya&quot;, &quot;voice&quot;: &quot;warm&quot;,</s>{"\n"}{"       "}<s>&quot;text&quot;: &quot;Barka da safiya! Ga labaran yau.&quot;{"}'"}</s> \{"\n"}{"  "}-o labarai.wav</>,
  kora: <><b>curl</b> {HOST}/v1/translate \{"\n"}{AUTH}{"  "}-F <s>model=&quot;kora&quot;</s> \{"\n"}{"  "}-F <s>target=&quot;fr&quot;</s> \{"\n"}{"  "}-F <s>file=&quot;@kasuwa.wav&quot;</s></>,
  air: <><b>wscat</b> -c wss://api.namu-ai.org/v1/converse \{"\n"}{AUTH}{"  "}-x <s>{"'{"}&quot;type&quot;: &quot;session.start&quot;, &quot;model&quot;: &quot;air&quot;{"}'"}</s></>,
};
const DURATION: Record<string, number> = { tatsuniya: 3200, tafiya: 2800, kora: 3400, air: 4200 };

/* Words that arrive one after another, as a streamed response does. */
function Stream({ text, start = 0, step = 160, lang }: { text: string; start?: number; step?: number; lang?: string }) {
  const words = text.split(" ");
  return <span lang={lang}>{words.map((w, i) => <span key={i} className="as-w" style={{ animationDelay: `${start + i * step}ms` }}>{i < words.length - 1 ? `${w} ` : w}</span>)}</span>;
}
function Wave({ n = 46, start = 0, className = "", scale = 1 }: { n?: number; start?: number; className?: string; scale?: number }) {
  return (
    <span className={`as-wave ${className}`} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const h = 12 + Math.round(30 * Math.abs(Math.sin(i * 1.31) * Math.cos(i * .37 + 1)) + 8 * Math.abs(Math.sin(i * 4.1)));
        return <i key={i} style={{ height: Math.max(2, Math.round(h * scale)), animationDelay: `${start + i * 38}ms` }} />;
      })}
    </span>
  );
}

function Response({ slug }: { slug: string }) {
  if (slug === "tatsuniya") return (
    <div className="as-json">
      <span className="as-file"><Icon name="waveform" size={16} stroke={1.5} />kira.wav<Wave n={22} className="mini" scale={.3} /></span>
      <pre>{"{\n  "}<s>&quot;text&quot;</s>{": \""}<Stream text="Barka da safiya! Ga labaran yau daga Yamai." start={500} lang="ha" />{"\",\n  "}<span className="as-late" style={{ animationDelay: "1900ms" }}><s>&quot;audio_seconds&quot;</s>: 3.1</span>{"\n}"}</pre>
    </div>
  );
  if (slug === "tafiya") return (
    <div className="as-audio">
      <span className="as-play"><Icon name="play" size={18} stroke={1.8} /></span>
      <Wave n={58} start={200} />
      <span className="as-meta as-late" style={{ animationDelay: "2400ms" }}>labarai.wav · 2.6 s</span>
    </div>
  );
  if (slug === "kora") return (
    <div className="as-json">
      <span className="as-file"><Icon name="waveform" size={16} stroke={1.5} />kasuwa.wav<Wave n={22} className="mini" scale={.3} /></span>
      <pre>{"{\n  "}<s>&quot;target&quot;</s>{": \"fr\",\n  "}<s>&quot;text&quot;</s>{": \""}<Stream text="Je voudrais acheter du mil au marché demain matin." start={600} lang="fr" />{"\"\n}"}</pre>
    </div>
  );
  return (
    <ol className="as-events">
      {[
        ["session.started", null, 200],
        ["input.speech", "Sannu Aïr, ina kwana?", 900],
        ["output.speech", "Lafiya lau! Me kake so mu tattauna yau?", 2000],
      ].map(([type, said, at]) => (
        <li key={type as string} className="as-late" style={{ animationDelay: `${at}ms` }}>
          <code>{type as string}</code>
          {said && <span lang="ha"><Wave n={10} className="mini" scale={.3} start={(at as number) + 100} />{said as string}</span>}
        </li>
      ))}
    </ol>
  );
}

export function ApiStudio({ a }: { a: ApiCopy }) {
  const [i, setI] = useState(0);
  const [run, setRun] = useState(0);          // bumps to replay the response
  const [done, setDone] = useState(false);
  const [held, setHeld] = useState(false);    // the visitor picked a model; stop moving on
  const m = a.models[i];

  useEffect(() => {
    setDone(false);
    const t = setTimeout(() => setDone(true), DURATION[m.slug]);
    return () => clearTimeout(t);
  }, [i, run, m.slug]);
  useEffect(() => {
    if (held || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setI(k => (k + 1) % a.models.length), DURATION[m.slug] + 3200);
    return () => clearTimeout(t);
  }, [i, held, m.slug, a.models.length]);

  return (
    <div className="as">
      <div className="as-tabs" role="tablist" aria-label={a.modelsH}>
        {a.models.map((x, k) => (
          <button key={x.slug} type="button" role="tab" aria-selected={k === i} onClick={() => { setI(k); setHeld(true); setRun(r => r + 1); }}>
            <span>{x.verb}</span><small>{x.name}</small>
          </button>
        ))}
      </div>
      <div className="as-body" role="tabpanel" aria-label={`${m.verb}, ${m.name}`}>
        <div className="as-req">
          <div className="as-head"><span className="as-method">{m.slug === "air" ? "WSS" : "POST"}</span><code>{m.endpoint}</code><span className="as-label">{a.studio.request}</span></div>
          <pre key={`q${i}`}>{REQUEST[m.slug]}</pre>
        </div>
        <div className="as-res">
          <div className="as-head">
            <span className={`as-state${done ? " done" : ""}`}><i aria-hidden="true" />{done ? a.studio.done : a.studio.streaming}</span>
            <span className="as-label">{a.studio.response}</span>
            <button type="button" className="as-replay" onClick={() => { setRun(r => r + 1); setHeld(true); }}><Icon name="full-duplex" size={14} stroke={1.6} />{a.studio.replay}</button>
          </div>
          <div className="as-out" key={`r${i}-${run}`} aria-live="polite"><Response slug={m.slug} /></div>
        </div>
      </div>
      <p className="as-note"><i aria-hidden="true" />{a.studio.note}</p>
    </div>
  );
}
