/* The API landing page (/api), after openai.com/api, adapted to Namu.
   Claims gate: the API is not public; every model is "In development" or "In research"; no prices, no
   customers, no compliance badges. Use cases are what could be built, not deployments. The code sample is
   labelled illustrative. Principles come from the Lab's decided commitments (consent tiers, strict and
   folded scoring, frozen test sets).
   FR-REVIEW: drafted French, to be reviewed by a native French speaker before publication. */
import type { Lang } from "@/i18n/config";

const n = " ";   // narrow no-break space before French high punctuation

type ModelCard = { slug: string; name: string; task: string; io: string; languages: string; status: string; href: string };
type Guide = { t: string; d: string; href: string; cta: string };
type Pillar = { t: string; d: string };
type UseCase = { icon: string; t: string; d: string };
type Column = { t: string; items: string[] };

export type ApiCopy = {
  meta: [string, string];
  status: string; h1: string; lede: string; access: string; talk: string;
  strip: string[];
  modelsH: string; modelsSub: string; labels: { task: string; io: string; languages: string; status: string }; learnMore: string;
  models: ModelCard[];
  pricingNote: string;
  guidesH: string; guides: Guide[];
  platformH: string; platformSub: string; readResearch: string;
  pillars: Pillar[];
  codeNote: string;
  useH: string; useSub: string; useCta: string; uses: UseCase[];
  respH: string; respSub: string; columns: Column[];
  startH: string;
  partner: { t: string; items: string[]; cta: string };
  build: { t: string; items: string[]; cta: string };
};

const en: ApiCopy = {
  meta: ["API", "The Namu API will bring the Lab’s speech models for Hausa to developers and organisations: speech recognition, speech synthesis, speech translation and live conversation."],
  status: "In development",
  h1: "Build voice products for Hausa on Namu’s platform",
  lede: "One API for the Lab’s speech models: hear, speak, translate and hold a conversation in Hausa, with Zarma next.",
  access: "Request early access", talk: "Talk to us",
  strip: ["Speech recognition", "Speech synthesis", "Speech translation", "Live conversation", "Hausa", "Zarma, next"],
  modelsH: "Powered by the Lab’s speech models",
  modelsSub: "Each one comes from the research on this site, and each will be released with a model card.",
  labels: { task: "Task", io: "Works with", languages: "Languages", status: "Status" },
  learnMore: "Learn more",
  models: [
    { slug: "tatsuniya", name: "Tatsuniya", task: "Speech recognition", io: "Speech in, text out", languages: "Hausa", status: "In development", href: "https://www.namu-ai.org/models/tatsuniya" },
    { slug: "tafiya", name: "Tafiya", task: "Speech synthesis", io: "Text in, speech out", languages: "Hausa", status: "In development", href: "https://www.namu-ai.org/models/tafiya" },
    { slug: "kora", name: "Kora", task: "Speech translation", io: "Speech in, translation out", languages: "Hausa, French", status: "In development", href: "https://www.namu-ai.org/models/kora" },
    { slug: "air", name: "Aïr", task: "Live conversation", io: "A spoken conversation", languages: "Hausa", status: "In research", href: "/models/air" },
  ],
  pricingNote: "Pricing, rate limits and data terms will be published with each model’s release.",
  guidesH: "Get ready to build with Hausa speech",
  guides: [
    { t: "How we score Hausa", d: "Every result is reported twice: strict, and folded for spelling variants. Learn to read both.", href: "/research/why-we-report-every-hausa-score-twice", cta: "Read the method" },
    { t: "Know your test set", d: "Who is, and is not, in the FLEURS Hausa test set that most results are measured on.", href: "/research/who-is-in-the-fleurs-hausa-test-set", cta: "Read the analysis" },
    { t: "Hear a conversation", d: "Listen to Aïr, the Lab’s research system for holding a conversation in Hausa.", href: "/models/air", cta: "Hear Aïr" },
  ],
  platformH: "One platform for voice in Hausa",
  platformSub: "Listen, speak and converse through one API, with the same measurement behind every model.",
  readResearch: "Read the research",
  pillars: [
    { t: "Listen", d: "Turn Hausa speech into text you can search, caption and act on." },
    { t: "Speak", d: "Turn written Hausa into natural speech, for apps, phone lines and devices." },
    { t: "Converse", d: "Hold a live spoken conversation, or translate speech between Hausa and French." },
  ],
  codeNote: "Illustrative. The API is not public yet, and names may change before release.",
  useH: "What you can build with it",
  useSub: "For teams that need to reach people in the language they speak.",
  useCta: "Talk to us",
  uses: [
    { icon: "phone-voice", t: "Customer service", d: "Voice agents that answer customers in Hausa, by voice, at any hour." },
    { icon: "transcript", t: "Captions and transcripts", d: "Turn Hausa radio, video and meetings into searchable text." },
    { icon: "paper", t: "Education", d: "Lessons, reading support and tutoring that students can speak to." },
    { icon: "headphones", t: "Information lines", d: "Health and farming information that people can ask for out loud, without reading or typing." },
    { icon: "translate", t: "Translation", d: "Carry Hausa content into French, and French content into Hausa." },
    { icon: "microphone", t: "Accessibility", d: "Products that work for people who would rather speak than read and type." },
  ],
  respH: "Built the way the Lab works",
  respSub: "The commitments behind every model the API will serve.",
  columns: [
    { t: "Measured honestly", items: ["A model card with every release", "Every Hausa score reported strict and folded", "Test sets frozen before training, with no speaker in both", "Results published with the conditions they were measured in"] },
    { t: "Built on consented data", items: ["Speakers told, in their language, how their voice will be used", "Speakers choose the licence for their recordings", "Speakers paid for their time", "A way to withdraw from every release"] },
    { t: "Made for Hausa", items: ["Written in the orthography each country uses", "Hausa from Niger and from Nigeria", "Test sets split by dialect and by gender", "Zarma next, as the Zarma programme starts"] },
  ],
  startH: "Get started",
  partner: { t: "Partner with us", items: ["Evaluate the models in your own setting", "Contribute speech through the Rumbu programme", "Help decide what we release first"], cta: "Talk to us" },
  build: { t: "Build on your own", items: ["Early access as each model is released", "A model card and evaluation for every release", "Code from the Lab on GitHub"], cta: "Request early access" },
};

const fr: ApiCopy = {
  meta: ["API", `L’API de Namu mettra les modèles de parole du Lab pour le hausa à la disposition des développeurs et des organisations${n}: reconnaissance vocale, synthèse vocale, traduction de la parole et conversation en direct.`],
  status: "En développement",
  h1: "Créez des produits vocaux en hausa sur la plateforme de Namu",
  lede: "Une seule API pour les modèles de parole du Lab : entendre, parler, traduire et tenir une conversation en hausa, puis en zarma.".replace(" :", `${n}:`),
  access: "Demander un accès anticipé", talk: "Nous contacter",
  strip: ["Reconnaissance vocale", "Synthèse vocale", "Traduction de la parole", "Conversation en direct", "Hausa", "Zarma, bientôt"],
  modelsH: "Propulsée par les modèles de parole du Lab",
  modelsSub: "Chacun est issu des recherches présentées sur ce site, et chacun sera publié avec sa fiche de modèle.",
  labels: { task: "Tâche", io: "Fonctionne avec", languages: "Langues", status: "Statut" },
  learnMore: "En savoir plus",
  models: [
    { slug: "tatsuniya", name: "Tatsuniya", task: "Reconnaissance vocale", io: "Parole en entrée, texte en sortie", languages: "Hausa", status: "En développement", href: "https://www.namu-ai.org/models/tatsuniya" },
    { slug: "tafiya", name: "Tafiya", task: "Synthèse vocale", io: "Texte en entrée, parole en sortie", languages: "Hausa", status: "En développement", href: "https://www.namu-ai.org/models/tafiya" },
    { slug: "kora", name: "Kora", task: "Traduction de la parole", io: "Parole en entrée, traduction en sortie", languages: "Hausa, français", status: "En développement", href: "https://www.namu-ai.org/models/kora" },
    { slug: "air", name: "Aïr", task: "Conversation en direct", io: "Une conversation parlée", languages: "Hausa", status: "En recherche", href: "/models/air" },
  ],
  pricingNote: "Les tarifs, les limites d’utilisation et les conditions relatives aux données seront publiés avec chaque modèle.",
  guidesH: "Préparez-vous à construire avec la parole hausa",
  guides: [
    { t: "Comment nous évaluons le hausa", d: "Chaque résultat est donné deux fois : strict, et replié pour les variantes d’orthographe. Apprenez à lire les deux.".replace(" :", `${n}:`), href: "/research/why-we-report-every-hausa-score-twice", cta: "Lire la méthode" },
    { t: "Connaître son jeu de test", d: "Qui figure, et qui ne figure pas, dans le jeu de test hausa de FLEURS sur lequel la plupart des résultats sont mesurés.", href: "/research/who-is-in-the-fleurs-hausa-test-set", cta: "Lire l’analyse" },
    { t: "Écouter une conversation", d: "Écoutez Aïr, le système de recherche du Lab pour tenir une conversation en hausa.", href: "/models/air", cta: "Écouter Aïr" },
  ],
  platformH: "Une plateforme pour la voix en hausa",
  platformSub: "Écouter, parler et converser avec une seule API, avec la même mesure derrière chaque modèle.",
  readResearch: "Lire la recherche",
  pillars: [
    { t: "Écouter", d: "Transformer la parole hausa en texte que l’on peut rechercher, sous-titrer et exploiter." },
    { t: "Parler", d: "Transformer le hausa écrit en parole naturelle, pour les applications, les lignes téléphoniques et les appareils." },
    { t: "Converser", d: "Tenir une conversation parlée en direct, ou traduire la parole entre le hausa et le français." },
  ],
  codeNote: "Exemple illustratif. L’API n’est pas encore publique, et les noms peuvent changer avant sa sortie.",
  useH: "Ce que vous pouvez construire",
  useSub: "Pour les équipes qui doivent toucher les gens dans la langue qu’ils parlent.",
  useCta: "Nous contacter",
  uses: [
    { icon: "phone-voice", t: "Service client", d: "Des agents vocaux qui répondent aux clients en hausa, à la voix, à toute heure." },
    { icon: "transcript", t: "Sous-titres et transcriptions", d: "Transformer la radio, la vidéo et les réunions en hausa en texte consultable." },
    { icon: "paper", t: "Éducation", d: "Des leçons, une aide à la lecture et du tutorat auxquels les élèves peuvent parler." },
    { icon: "headphones", t: "Lignes d’information", d: "Des informations sur la santé et l’agriculture que l’on peut demander à voix haute, sans lire ni écrire." },
    { icon: "translate", t: "Traduction", d: "Faire passer des contenus du hausa vers le français, et du français vers le hausa." },
    { icon: "microphone", t: "Accessibilité", d: "Des produits pour celles et ceux qui préfèrent parler plutôt que lire et écrire." },
  ],
  respH: "Construite selon les principes du Lab",
  respSub: "Les engagements derrière chaque modèle que servira l’API.",
  columns: [
    { t: "Une mesure honnête", items: ["Une fiche de modèle à chaque publication", "Chaque score hausa donné en strict et en replié", "Des jeux de test figés avant l’entraînement, sans locuteur commun", "Des résultats publiés avec leurs conditions de mesure"] },
    { t: "Des données consenties", items: ["Les locuteurs savent, dans leur langue, comment leur voix sera utilisée", "Les locuteurs choisissent la licence de leurs enregistrements", "Les locuteurs sont rémunérés pour leur temps", "Un moyen de se retirer de chaque publication"] },
    { t: "Pensée pour le hausa", items: ["Écrit dans l’orthographe de chaque pays", "Le hausa du Niger et du Nigeria", "Des jeux de test répartis par dialecte et par genre", "Le zarma ensuite, avec le démarrage du programme Zarma"] },
  ],
  startH: "Commencer",
  partner: { t: "Devenez partenaire", items: ["Évaluez les modèles dans votre propre contexte", "Contribuez des enregistrements via le programme Rumbu", "Aidez-nous à décider ce que nous publions en premier"], cta: "Nous contacter" },
  build: { t: "Construisez par vous-même", items: ["Un accès anticipé à mesure que chaque modèle est publié", "Une fiche de modèle et une évaluation pour chaque publication", "Le code du Lab sur GitHub"], cta: "Demander un accès anticipé" },
};

export const apiCopy: Record<Lang, ApiCopy> = { en, fr };
