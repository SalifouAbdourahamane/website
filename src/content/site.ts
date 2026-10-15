export const site = {
  name: "Namu AI Lab",
  url: "https://lab.namu-ai.org",
  parent: { name: "Namu", url: "https://www.namu-ai.org" },
  description: "Namu AI Lab is the research unit of Namu. We study how machines hear, understand and answer in the languages of the Sahel.",
};

/* Icons come from the Lab set (src/lib/icons.ts). */
export const programmeIcon: Record<string, string> = { hira: "turns", rumbu: "consent", zarma: "language", tankade: "filter", maauni: "check" };

export type ModelStatus = "In research" | "In development" | "Early preview" | "Available";
export const models: { slug: string; name: string; line: string; task: string; languages: string; status: ModelStatus; icon: string; href: string; isNew?: boolean }[] = [
  { slug: "air", name: "Aïr", line: "A voice agent that holds a conversation in the languages of the Sahel", task: "Voice agent", languages: "Languages of the Sahel", status: "In research", icon: "phone-voice", href: "/models/air", isNew: true },
  { slug: "kora", name: "Kora", line: "Speech translation between the languages of the Sahel and French", task: "Speech translation", languages: "Languages of the Sahel, French", status: "In development", icon: "translate", href: "https://www.namu-ai.org/models/kora" },
  { slug: "tatsuniya", name: "Tatsuniya", line: "Speech recognition built for the languages of the Sahel", task: "Speech recognition", languages: "Languages of the Sahel", status: "In development", icon: "transcript", href: "https://www.namu-ai.org/models/tatsuniya" },
  { slug: "tafiya", name: "Tafiya", line: "Natural, expressive speech synthesis for the languages of the Sahel", task: "Speech synthesis", languages: "Languages of the Sahel", status: "In development", icon: "volume", href: "https://www.namu-ai.org/models/tafiya" },
];

export const switcher = [
  { href: "https://www.namu-ai.org", label: "Namu", note: "Products" },
  { href: "/", label: "Namu AI Lab", note: "Research", current: true },
  { href: "https://github.com/namu-ai-lab", label: "GitHub", note: "Code" },
];

export const footerCols = [
  { title: "Models", links: models.map(m => ({ label: m.name, href: m.href, icon: m.icon })) },
  { title: "Research", links: [
    { label: "Hira", href: "/programmes/hira", icon: "turns" }, { label: "Rumbu", href: "/programmes/rumbu", icon: "consent" },
    { label: "Zarma", href: "/programmes/zarma", icon: "language" }, { label: "Tankaɗe", href: "/programmes/tankade", icon: "filter" },
    { label: "Maʼauni", href: "/programmes/maauni", icon: "check" }, { label: "All research", href: "/research" },
  ] },
  { title: "Learn more", links: [
    { label: "About", href: "/about" }, { label: "News", href: "/research#latest" }, { label: "Data", href: "/data" },
    { label: "Careers", href: "/about#careers" }, { label: "Contact", href: "mailto:contact@namuai.org" },
  ] },
] as { title: string; links: { label: string; href: string; icon?: string }[] }[];
