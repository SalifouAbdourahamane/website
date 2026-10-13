"use client";

import { useEffect, useRef } from "react";
import { createTurnTaking } from "@/lib/turn-taking";
import { createStrictFolded } from "@/lib/strict-folded";
import { createTestSet } from "@/lib/test-set";
import { createBlossomPlayer } from "@/lib/blossom-player";
import { createUtterance } from "@/lib/utterance";
import { FLEURS_HA_TEST } from "@/content/fleurs-ha-test";

function useMount(fn: (el: HTMLDivElement) => unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.innerHTML = "";
    fn(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

/** Hira — the conversation score. Line text from namu-ai.org's Aïr page; timing illustrative. */
export function ConversationScore() {
  const ref = useMount(el => {
    const tt = createTurnTaking(el, {
      duration: 10, caption: "Illustrative timing — not a measurement",
      lanes: [{ id: "air", label: "Aïr" }, { id: "caller", label: "Caller" }],
      segments: [
        { lane: "air", start: .2, end: 3.55, cut: true, text: "Ana yin allurar rigakafi kowace Talata da Alhamis, daga ƙarfe…", gloss: "Vaccinations are every Tuesday and Thursday, from…" },
        { lane: "caller", start: 2.85, end: 4.9, text: "Aʼa, ba wannan ba. Ina son na Zinder.", gloss: "No, not that one. I want Zinder." },
        { lane: "air", start: 5.35, end: 8.2, text: "Na gane. A Zinder, ranar Litinin kawai ake yi.", gloss: "Understood. In Zinder it is Mondays only." },
        { lane: "caller", start: 6.7, end: 6.98, kind: "backchannel" },
        { lane: "caller", start: 8.7, end: 9.7, text: "To, na gode.", gloss: "Alright, thank you." },
      ],
      events: [{ at: 3.55, label: "Aïr yields" }, { at: 6.7, label: "backchannel" }],
    });
    tt.seek(4.2);
  });
  return <div ref={ref} />;
}

export function StrictFolded() {
  const ref = useMount(el => createStrictFolded(el, {
    reference: "Ana yin allurar rigakafi kowace Talata da Alhamis, daga ƙarfe takwas na safe.",
    hypothesis: "ana yin allurar rigakafi kowace talata da alhamis daga karfe takwas da safe",
  }));
  return <div ref={ref} />;
}

export function TestSetStrip() {
  // The engine is ported JS (see src/lib); its option bag is typed loosely.
  const ref = useMount(el => createTestSet(el, FLEURS_HA_TEST, {
    animate: true,
    caption: "Each mark is one utterance of the FLEURS Hausa (ha_ng) test split, in file order. Colour is the gender recorded in the dataset; each mark’s tooltip gives its length. Source: google/fleurs, data/ha_ng/test.tsv, CC BY 4.0, read 12 Oct 2026.",
  } as Parameters<typeof createTestSet>[2] & { caption: string }));
  return <div ref={ref} />;
}

export function UtterancePipeline() {
  const ref = useMount(el => {
    const lu = createUtterance(el, {
      speech: [[.05, .47], [.55, .94]],
      words: [{ raw: "daga", clean: "daga", at: .06 }, { raw: "karfe", clean: "ƙarfe", at: .15 }, { raw: "8", clean: "takwas", at: .25 }, { raw: "na", clean: "na", at: .345 }, { raw: "safe", clean: "safe", at: .4 }, { raw: "zuwa", clean: "zuwa", at: .56 }, { raw: "karfe", clean: "ƙarfe", at: .66 }, { raw: "2", clean: "biyu", at: .77 }],
      consent: [{ scope: "ASR training", allowed: true }, { scope: "Evaluation", allowed: true }, { scope: "Voice cloning", allowed: false }, { scope: "Public release", allowed: false }],
    });
    lu.go(4, true);
  });
  return <div ref={ref} />;
}

export function BlossomPlayer({ label, gloss, note, words, duration }: {
  label: string; gloss: string; note?: string; duration: number; words: { w: string; start: number; end: number }[];
}) {
  const ref = useMount(el => createBlossomPlayer(el, { label, gloss, note, words, duration }));
  return <div ref={ref} />;
}
