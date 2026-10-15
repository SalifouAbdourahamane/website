import { ConversationScore, StrictFolded, TestSetStrip, UtterancePipeline } from "./figures";

const FIGS = {
  "test-set": TestSetStrip,
  "strict-folded": StrictFolded,
  "conversation": ConversationScore,
  "pipeline": UtterancePipeline,
} as const;

/** An interactive figure placed inside a post body: wider than the text column, on a soft panel. */
export function FigureSlot({ name, caption, lang = "en" }: { name: keyof typeof FIGS | string; caption?: string; lang?: "en" | "fr" }) {
  const Fig = FIGS[name as keyof typeof FIGS];
  if (!Fig) return null;
  return (
    <figure className="wide">
      <div className="fig"><Fig lang={lang} /></div>
      {caption && <figcaption className="fig-cap">{caption}</figcaption>}
    </figure>
  );
}
