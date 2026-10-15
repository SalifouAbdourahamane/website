/* The home page console: a design preview of trying the Lab's models (after elevenlabs.io's hero panel
   and openai.fm). Nothing here is connected to a model; the console says so in its footer.
   HA-REVIEW: every Hausa sentence below was written for this preview and needs a native speaker's check.
   FR-REVIEW: drafted French, to be reviewed by a native French speaker before publication. */
import type { Lang } from "@/i18n/config";

const n = " ";   // narrow no-break space before French high punctuation

export type Script = { id: string; label: string; text: string; gloss: string };
export type Voice = { id: string; name: string; note: string; palette: [string, string, string] };
export type Line = { who: "you" | "air"; text: string; gloss: string };

export type PlaygroundCopy = {
  title: string; sub: string; hearAir: string;
  tabs: { id: string; label: string; model: string }[];
  preview: string; earlyAccess: string;
  speak: { script: string; voices: string; play: string; stop: string; chars: (k: number) => string; dialects: string[]; region: string; speaking: string };
  listen: { tap: string; listening: string; done: string; strict: string; folded: string; transcript: string; why: string; hint: string };
  translate: { from: string; to: string; swap: string; run: string; listen: string };
  converse: { start: string; end: string; you: string; air: string; status: string; connecting: string };
  api: { run: string; running: string; output: string; illustrative: string };
};

export const scripts: Record<Lang, Script[]> = {
  en: [
    { id: "news", label: "Morning news", text: "Barka da safiya! Ga labaran yau daga Yamai da Kano: an yi ruwan sama mai yawa a daren jiya.", gloss: "Good morning! Here is today’s news from Niamey and Kano: there was heavy rain last night." },
    { id: "clinic", label: "Clinic reminder", text: "Sannu Hauwa. Muna tunatar da ke cewa ganinki da likita gobe ne, da ƙarfe tara na safe.", gloss: "Hello Hauwa. A reminder that your appointment with the doctor is tomorrow, at nine in the morning." },
    { id: "market", label: "Market prices", text: "Farashin gero a kasuwar Maraɗi ya sauka kaɗan a wannan mako.", gloss: "The price of millet at Maradi market fell a little this week." },
    { id: "tale", label: "Folktale", text: "Gatanan, gatananku! Wata rana Gizo ya tafi kasuwa da ƙwarya cike da zuma.", gloss: "Once upon a time! One day Spider went to the market with a calabash full of honey." },
  ],
  fr: [
    { id: "news", label: "Journal du matin", text: "Barka da safiya! Ga labaran yau daga Yamai da Kano: an yi ruwan sama mai yawa a daren jiya.", gloss: `Bonjour${n}! Voici les nouvelles du jour depuis Niamey et Kano${n}: il a beaucoup plu la nuit dernière.` },
    { id: "clinic", label: "Rappel de rendez-vous", text: "Sannu Hauwa. Muna tunatar da ke cewa ganinki da likita gobe ne, da ƙarfe tara na safe.", gloss: "Bonjour Hauwa. Nous vous rappelons votre rendez-vous chez le médecin demain, à neuf heures du matin." },
    { id: "market", label: "Prix du marché", text: "Farashin gero a kasuwar Maraɗi ya sauka kaɗan a wannan mako.", gloss: "Le prix du mil au marché de Maradi a un peu baissé cette semaine." },
    { id: "tale", label: "Conte", text: "Gatanan, gatananku! Wata rana Gizo ya tafi kasuwa da ƙwarya cike da zuma.", gloss: `Il était une fois${n}! Un jour, l’Araignée partit au marché avec une calebasse pleine de miel.` },
  ],
};

export const voices: Record<Lang, Voice[]> = {
  en: [
    { id: "warm", name: "Warm", note: "Even and close, for reading", palette: ["#f29a5f", "#ffd8b8", "#b4552a"] },
    { id: "bright", name: "Bright", note: "Clear and quick, for news", palette: ["#ffd27f", "#fff1d6", "#e8935a"] },
    { id: "calm", name: "Calm", note: "Slow and steady, for care", palette: ["#e3b3c9", "#fcf2ef", "#bd7193"] },
    { id: "story", name: "Storyteller", note: "Lively, for tales", palette: ["#7a4325", "#f6b48a", "#1c1410"] },
  ],
  fr: [
    { id: "warm", name: "Chaleureuse", note: "Égale et proche, pour la lecture", palette: ["#f29a5f", "#ffd8b8", "#b4552a"] },
    { id: "bright", name: "Claire", note: "Nette et vive, pour l’info", palette: ["#ffd27f", "#fff1d6", "#e8935a"] },
    { id: "calm", name: "Posée", note: "Lente et sûre, pour le soin", palette: ["#e3b3c9", "#fcf2ef", "#bd7193"] },
    { id: "story", name: "Conteuse", note: "Vivante, pour les contes", palette: ["#7a4325", "#f6b48a", "#1c1410"] },
  ],
};

/* Strict keeps the hooked letters, case and punctuation; folded drops them, as the Lab's scoring does. */
export const heard = {
  strict: "Ƴan kasuwa sun ƙara farashin ɗan wake a Maraɗi.",
  folded: "yan kasuwa sun kara farashin dan wake a maradi",
  gloss: { en: "Traders have raised the price of bean cakes in Maradi.", fr: "Les commerçants ont augmenté le prix des beignets de haricot à Maradi." },
};

export const translation = {
  ha: "Ina so in sayi gero a kasuwa gobe da safe.",
  fr: "Je voudrais acheter du mil au marché demain matin.",
};

export const conversation: Record<Lang, Line[]> = {
  en: [
    { who: "you", text: "Sannu Aïr, ina kwana?", gloss: "Hello Aïr, good morning." },
    { who: "air", text: "Lafiya lau! Me kake so mu tattauna yau?", gloss: "Very well! What would you like to talk about today?" },
    { who: "you", text: "Ka ba ni labarin Gizo.", gloss: "Tell me a story about Spider." },
    { who: "air", text: "To, ga shi nan: wata rana Gizo ya tafi kasuwa…", gloss: "All right, here it is: one day Spider went to the market…" },
  ],
  fr: [
    { who: "you", text: "Sannu Aïr, ina kwana?", gloss: "Bonjour Aïr, bien dormi ?".replace(" ?", `${n}?`) },
    { who: "air", text: "Lafiya lau! Me kake so mu tattauna yau?", gloss: "Très bien ! De quoi veux-tu parler aujourd’hui ?".replace(" !", `${n}!`).replace(" ?", `${n}?`) },
    { who: "you", text: "Ka ba ni labarin Gizo.", gloss: "Raconte-moi une histoire de l’Araignée." },
    { who: "air", text: "To, ga shi nan: wata rana Gizo ya tafi kasuwa…", gloss: `Bien, la voici${n}: un jour, l’Araignée partit au marché…` },
  ],
};

export const playground: Record<Lang, PlaygroundCopy> = {
  en: {
    title: "Try the Lab’s models", sub: "Hear, speak, translate and converse in the languages of the Sahel", hearAir: "Hear Aïr",
    tabs: [
      { id: "speak", label: "Speak", model: "Tafiya" }, { id: "listen", label: "Listen", model: "Tatsuniya" },
      { id: "translate", label: "Translate", model: "Kora" }, { id: "converse", label: "Converse", model: "Aïr" }, { id: "api", label: "API", model: "Developers" },
    ],
    preview: "Design preview. These demos are not connected to the models yet.", earlyAccess: "Request early access",
    speak: { script: "Script", voices: "Voice", play: "Play", stop: "Stop", chars: k => `${k} characters`, dialects: ["Niger", "Nigeria"], region: "Region", speaking: "Speaking" },
    listen: { tap: "Tap to speak", listening: "Listening…", done: "Tap to try again", strict: "Strict", folded: "Folded", transcript: "Transcript", why: "Why we keep both", hint: "Say something in your language" },
    translate: { from: "Your language", to: "French", swap: "Swap languages", run: "Translate", listen: "Listen" },
    converse: { start: "Start a conversation", end: "End", you: "You", air: "Aïr", status: "Aïr · In research", connecting: "Connecting…" },
    api: { run: "Run code", running: "Running…", output: "Output", illustrative: "Illustrative. The API is not public yet." },
  },
  fr: {
    title: "Essayez les modèles du Lab", sub: "Écouter, parler, traduire et converser dans les langues du Sahel", hearAir: "Écouter Aïr",
    tabs: [
      { id: "speak", label: "Parler", model: "Tafiya" }, { id: "listen", label: "Écouter", model: "Tatsuniya" },
      { id: "translate", label: "Traduire", model: "Kora" }, { id: "converse", label: "Converser", model: "Aïr" }, { id: "api", label: "API", model: "Développeurs" },
    ],
    preview: "Aperçu de conception. Ces démonstrations ne sont pas encore reliées aux modèles.", earlyAccess: "Demander un accès anticipé",
    speak: { script: "Texte", voices: "Voix", play: "Lire", stop: "Arrêter", chars: k => `${k} caractères`, dialects: ["Niger", "Nigeria"], region: "Région", speaking: "Lecture" },
    listen: { tap: "Touchez pour parler", listening: "Écoute…", done: "Touchez pour recommencer", strict: "Strict", folded: "Replié", transcript: "Transcription", why: "Pourquoi garder les deux", hint: "Dites quelque chose dans votre langue" },
    translate: { from: "Votre langue", to: "Français", swap: "Inverser les langues", run: "Traduire", listen: "Écouter" },
    converse: { start: "Démarrer une conversation", end: "Terminer", you: "Vous", air: "Aïr", status: "Aïr · En recherche", connecting: "Connexion…" },
    api: { run: "Exécuter", running: "Exécution…", output: "Résultat", illustrative: "Exemple illustratif. L’API n’est pas encore publique." },
  },
};
