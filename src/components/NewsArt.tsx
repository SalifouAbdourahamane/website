import { Blueprint, GlassArt, NightArt } from "./Art";

/** One artwork per news item and per programme, so the same story always wears the same picture. */
export function NewsArt({ art, ratio = "square" }: { art: string; ratio?: "square" | "card" | "wide" }) {
  switch (art) {
    case "intro": return <GlassArt motif="blossom" palette="apricot" ratio={ratio} place="centre" />;
    case "fleurs": return <NightArt seed="fleurs-ha" ratio={ratio} tone="rose" />;
    case "strict": return <GlassArt motif="glyph" ch="ɗ" palette="ember" ratio={ratio} place="centre" />;
    case "swahili": return <GlassArt motif="bars" palette="dusk" ratio={ratio} place="centre" />;
    case "hausa": return <GlassArt motif="glyph" ch="ƴ" palette="sand" ratio={ratio} place="centre" />;
    default: return <GlassArt motif="talk" ratio={ratio} />;
  }
}

export function ProgrammeArt({ slug, ratio = "card" }: { slug: string; ratio?: "square" | "card" | "wide" }) {
  switch (slug) {
    case "hira": return <Blueprint kind="hira" ratio={ratio} />;
    case "rumbu": return <NightArt seed="rumbu" ratio={ratio} />;
    case "zarma": return <GlassArt motif="glyph" ch="ŋ" palette="dusk" ratio={ratio} />;
    case "tankade": return <GlassArt motif="sieve" palette="sand" ratio={ratio} />;
    case "maauni": return <GlassArt motif="glyph" ch="ƙ" palette="ember" ratio={ratio} />;
    case "air": return <GlassArt motif="talk" palette="apricot" ratio={ratio} />;
    default: return <GlassArt motif="blossom" ratio={ratio} />;
  }
}
export const darkArt = new Set(["rumbu", "maauni", "fleurs", "strict"]);
