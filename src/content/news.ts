/* The homepage and research index read news from here: Lab posts plus items published elsewhere.
   Only real items; dates are publication dates. */
export type NewsItem = { href: string; title: string; titleFr?: string; date: string; topic: string; art: string; external?: boolean };

export const news: NewsItem[] = [
  { href: "/research/introducing-namu-ai-lab", title: "Introducing Namu AI Lab", date: "2026-10-13", topic: "Lab", art: "intro" },
  { href: "/research/who-is-in-the-fleurs-hausa-test-set", title: "Who is in the FLEURS Hausa test set", date: "2026-10-13", topic: "Data", art: "fleurs" },
  { href: "/research/why-we-report-every-hausa-score-twice", title: "Why we report every Hausa score twice", date: "2026-10-13", topic: "Measurement", art: "strict" },
  { href: "/research/swahili-asr-challenge", title: "Winning the Swahili ASR challenge on a single 16GB GPU", date: "2025-09-19", topic: "Research", art: "swahili" },
  { href: "https://www.namu-ai.org/blog/starting-with-hausa", title: "Starting with Hausa, and what comes after it", titleFr: "Commencer par le haoussa, et la suite", date: "2025-09-08", topic: "Story", art: "hausa", external: true },
];

