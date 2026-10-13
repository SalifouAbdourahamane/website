// The five launch programmes. Source of every sentence:
// ~/.claude/skills/namu-ai-lab/references/research-programmes.md (claims gate applies).
// Hausa names are working names (decision D10); the founders may revise them.

export type ProgrammeStatus = "Active" | "Opening" | "Starting" | "Paused" | "Concluded";
export type Rung = { state: "done" | "now" | "next"; title: string; detail?: string; when?: string };

export type Programme = {
  slug: string;
  name: string;            // short name, may be Hausa
  title: string;           // plain English title
  status: ProgrammeStatus;
  since?: string;
  sentence: string;        // one sentence
  question: string;        // the programme's guiding question (the page's one italic line)
  description: string[];   // site-ready paragraphs
  questions: string[];
  ladder: Rung[];          // dates only on done rungs (none published yet)
  outputs: string[];
  noClaim: string[];       // "What we do not claim yet"
  collaborate: string;
  related: { label: string; href: string }[];
  feeds: string[];         // slugs this programme feeds (research map)
};

export const programmes: Programme[] = [
  {
    slug: "hira",
    name: "Hira",
    title: "Full-duplex conversation in Hausa",
    status: "Active",
    sentence: "Speech models that listen while they speak, built for Hausa and judged against how Hausa speakers actually take turns.",
    question: "Can a machine listen while it speaks, in Hausa, and take turns the way Hausa speakers do?",
    description: [
      "People do not talk in turns that wait politely for silence. They answer before a sentence ends, say “to” and “eh” while the other person is still speaking, stop when interrupted, and stretch a greeting across many exchanges because the greeting is the point. Most voice systems ignore all of this: they wait, transcribe, think, then speak.",
      "Hira is our research into full-duplex speech for Hausa: models that hear and speak at the same time. Our working system, Aïr, separates the problem in three. An ear turns Hausa speech into something a language model can read. A brain, a multilingual model whose weights we do not retrain, decides what to say. A mouth, built on Kyutai’s Moshi architecture, speaks while it keeps listening, so it can wait, stop or acknowledge.",
      "We started there because our first attempt, teaching one model everything at once, learned the rhythm of conversation but not its sense. The questions now are harder ones. How do Hausa speakers time their turns? Which backchannels do they use, and where? Can a model learn this from tens of hours of real conversation when published systems used tens of thousands? And how do we measure it without borrowing English answers?",
      "We will publish what we measure, including what does not work.",
    ],
    questions: [
      "What are the timing norms of Hausa conversation — gaps, overlaps, backchannel rate, placement and inventory — in Niger and in Nigeria, face to face and on the phone?",
      "Can a duplex model keep the turn-taking skills of an English base while it learns Hausa content from a separate brain, and how much real Hausa conversation does it need to sound Hausa rather than translated?",
      "Is the thinker–talker split (an ear, a brain and a mouth) a better trade than single-stream duplex models for low-resource languages, measured on relevance, latency and naturalness together?",
      "How should full-duplex behaviour be evaluated in a language with no turn-taking benchmark, and who judges it?",
    ],
    ladder: [
      { state: "done", when: "Oct 2026", title: "Thinker–talker prototype running", detail: "Ear, brain and mouth run as one live research chain. Internal; write-up to follow." },
      { state: "now", title: "Aïr speech-to-speech end to end", detail: "Training the ear on real phone audio so hearing no longer goes through a transcript." },
      { state: "next", title: "Measure people first", detail: "Record consented two-channel Hausa conversations in Niger and Nigeria; publish their timing statistics." },
      { state: "next", title: "A Hausa voice-activity-projection model", detail: "Test whether English or multilingual turn-taking models transfer, against a held-out Hausa set." },
      { state: "next", title: "Hausa full-duplex benchmark v0", detail: "Tasks scored against human Hausa conversation, with a judging protocol calibrated on native raters." },
      { state: "next", title: "Native conversational judgement", detail: "At least five raters across dialects, agreement reported." },
      { state: "next", title: "Public demo and paper", detail: "With a system card and a voice-consent record." },
    ],
    outputs: ["Hausa conversation timing statistics", "A Hausa full-duplex benchmark", "Paper: thinker–talker for low-resource full duplex, with the negative result that led to it", "A disclosed research-preview demo of Aïr"],
    noClaim: [
      "Aïr’s live demo is not end-to-end speech-to-speech today: its hearing still goes through a transcript.",
      "Aïr has not learned Hausa turn-taking. Its timing is a policy plus distributions from other languages until real Hausa conversation is measured.",
      "No Aïr result is published yet. Internal numbers will appear with their conditions, after review.",
      "The brain is a third-party multilingual model (McGill AfriqueQwen). We do not retrain its weights, and we did not train it.",
    ],
    collaborate: "We are looking for paid Hausa speakers for two-person recordings, native-speaker raters across dialects, and researchers working on turn-taking.",
    related: [
      { label: "Moshi — Défossez et al., 2024", href: "https://arxiv.org/abs/2410.00037" },
      { label: "Multilingual turn-taking with VAP — Inoue et al., 2024", href: "https://arxiv.org/abs/2403.06487" },
      { label: "Full-Duplex-Bench — Lin et al., 2025", href: "https://arxiv.org/abs/2503.04721" },
      { label: "Universals and cultural variation in turn-taking — Stivers et al., 2009", href: "https://doi.org/10.1073/pnas.0903616106" },
    ],
    feeds: [],
  },
  {
    slug: "rumbu",
    name: "Rumbu",
    title: "A consented Hausa speech commons, Niger first",
    status: "Opening",
    sentence: "Hausa speech collected with consent and fair pay, from the people and places public datasets leave out.",
    question: "What would Hausa speech data look like if it were collected with the people it represents?",
    description: [
      "Most public Hausa speech data was read aloud from a script, in Nigeria, by people comfortable with a phone app. FLEURS, a benchmark many papers report, has a Hausa test set labelled Nigerian Hausa in which 620 of 621 utterances are spoken by women. That is not the Hausa our users speak, and models trained and tested on it learn a narrow version of the language.",
      "Rumbu is our programme to build the Hausa speech that is missing, the way a community keeps a granary: together, with care, and with clear rules about who may draw from it. We will record Hausa from Niger and Nigeria in its regional varieties: conversation between two people on separate channels, speech over ordinary phone calls as well as apps, and people who do not read, prompted by pictures and questions rather than text.",
      "Every speaker will give informed consent in Hausa, choose what their voice may be used for, and be paid for their time. Each dataset will ship with a data statement that says who is in it, how it was recorded and what it cannot support.",
      "We will release what consent and law allow, and say plainly what we keep closed and why.",
    ],
    questions: [
      "What does a representative Hausa speech sample look like across Niger and Nigeria, and how far are current public sets from it?",
      "How do you collect spontaneous and conversational Hausa from people who do not read, over ordinary phones, at a quality usable for recognition and conversation research?",
      "What consent design gives speakers real choices, and keeps those choices attached to every derived file and model?",
      "What is fair pay for a recording session in Niger and northern Nigeria, and how should it be reported?",
    ],
    ladder: [
      { state: "next", title: "Design and consent", detail: "Consent form and information sheet in Hausa (audio and text), scope options, pay rate, data-protection review, outside reviewers." },
      { state: "next", title: "Pilot", detail: "A small multi-dialect pilot with two-channel pairs and phone-line calls; cost per transcribed hour and quality, measured." },
      { state: "next", title: "Test set first", detail: "A speaker-disjoint, dialect- and gender-stratified evaluation set, frozen before training data is collected." },
      { state: "next", title: "Scale where the pilot shows gaps" },
      { state: "next", title: "Release", detail: "Data statement, licence tiers by consent, and a withdrawal process." },
    ],
    outputs: ["Rumbu-Hausa v0, released in tiers chosen by speakers’ consent", "A data statement and datasheet", "A phone-based, picture-prompted collection flow", "Paper: collecting conversational Hausa in Niger — consent, cost and coverage"],
    noClaim: [
      "Nothing has been collected yet. Rumbu is opening, not a dataset.",
      "We have not set the pay rate or a release date; both will be published before collection starts.",
      "No contributor’s face, name or village will appear without their explicit choice.",
    ],
    collaborate: "We are looking for community partners in Niger and northern Nigeria, people to review the consent design, and organisations that want to fund paid collection.",
    related: [
      { label: "Data Statements for NLP — Bender & Friedman, 2018", href: "https://doi.org/10.1162/tacl_a_00041" },
      { label: "The NaijaVoices Dataset — Emezue et al., 2025", href: "https://arxiv.org/abs/2505.20564" },
      { label: "VAANI — Pulikodan et al., 2026", href: "https://arxiv.org/abs/2603.28714" },
      { label: "Kaitiakitanga License — Te Hiku Media", href: "https://github.com/TeHikuMedia/Kaitiakitanga-License" },
    ],
    feeds: ["hira", "zarma"],
  },
  {
    slug: "zarma",
    name: "Zarma",
    title: "Zarma from the ground up",
    status: "Starting",
    sentence: "The first open, consented speech resources and honest baselines for Zarma, spoken by about six million people along the Niger.",
    question: "What does it take to build speech technology for a language that almost none exists for?",
    description: [
      "Zarma is spoken by about six million people along the Niger River, and it is one of the main languages of Niamey. It has four tones, long and short vowels, nasal vowels and letters like ɲ and ŋ. As far as we can find, it has no Common Voice collection, no FLEURS test set and no adapter in Meta’s widely used MMS recogniser. The largest speech resource, a Niger radio corpus described in 2026, has about sixty hours of verified Zarma transcription.",
      "This programme builds Zarma speech technology from the ground up, and in the right order. First a written convention that Zarma speakers recognise, aligned with Niger’s official orthography and honest about how people actually spell. Then a small, consented, carefully transcribed test set, so that every later claim has something to stand on. Then recordings and models: recognition first, then synthesis, then conversation.",
      "Zarma is also our test of method. We built our Hausa work so that a new language is added through a separate language pack, not by rewriting the system. Zarma will show whether that holds, how long it takes, and what does not transfer.",
      "We want to do this with Zarma speakers, writers and the researchers already building Zarma resources, not around them.",
    ],
    questions: [
      "What written convention should Zarma transcripts follow, and how should recognition be scored when more than one spelling is accepted?",
      "How well do multilingual systems that list Zarma actually recognise it on a clean, verified test set?",
      "How many hours of verified Zarma does a usable recogniser need, and does Hausa data help or hurt?",
      "Can a language pack add Zarma without rewriting the system, and what does that cost?",
    ],
    ladder: [
      { state: "next", title: "Orthography and normaliser", detail: "Vetted by at least two Zarma writers outside the founding team." },
      { state: "next", title: "A test set of a few hours", detail: "Consented, verified twice, frozen." },
      { state: "next", title: "Baselines", detail: "Existing systems on that test set, scored strict and folded." },
      { state: "next", title: "Training data", detail: "Radio-corpus access if granted, plus consented collection including Niamey code-mixed speech." },
      { state: "next", title: "Zarma recognition and synthesis v0", detail: "With native listening evaluation." },
    ],
    outputs: ["A Zarma text-normalisation spec with test cases", "Zarma test v0, with a data statement", "A public baseline report", "Paper: adding a language by language pack"],
    noClaim: [
      "Namu has no Zarma data, model or measurement yet. This programme is starting.",
      "Figures about existing Zarma corpora are their authors’ figures, not ours.",
      "Zarma has an official orthography (1999); everyday spelling varies. We do not say it has no writing system.",
    ],
    collaborate: "We are looking for Zarma writers and linguists, researchers building Zarma resources, and speakers in Niamey and along the river.",
    related: [
      { label: "SALAN: A Massive ASR Dataset for the Languages of Niger — Keita et al., LREC 2026", href: "https://aclanthology.org/2026.lrec-1.460/" },
      { label: "Feriji: A French-Zarma Parallel Corpus — Keita et al., 2024", href: "https://arxiv.org/abs/2406.05888" },
      { label: "Omnilingual ASR — 2025", href: "https://arxiv.org/abs/2511.09690" },
      { label: "Open but Incompatible — van Gassen, 2026", href: "https://arxiv.org/abs/2606.28867" },
    ],
    feeds: [],
  },
  {
    slug: "tankade",
    name: "Tankaɗe",
    title: "From raw audio to trustworthy data",
    status: "Active",
    sentence: "The methods that turn radio archives, field recordings and crowd audio into Hausa and Zarma data a model can learn from and a reader can trust.",
    question: "Which choices in cleaning speech data change what a model learns?",
    description: [
      "Most Hausa audio in the world was never made for machines. It is radio programmes with music under the news, phone-in interviews, sermons, people reading sentences into cheap phones. Before any of it can teach a model, someone has to decide what is speech, who is speaking, what was said, how it should be spelled, and whether it may be used at all.",
      "Tankaɗe is our research into that work. We treat it as research, not cleaning up, because every choice changes what a model learns. Cut segments at the wrong place and turn-taking disappears. Accept a transcript that drops the hooked letters ɓ, ɗ and ƙ, and the model learns that they do not matter. Enhance noisy audio with a generative model, and you train on sound that no one spoke.",
      "Our pipeline segments and diarises broadcast audio, filters transcripts by the agreement of two independent recognisers, aligns every word in time, repairs and standardises Hausa spelling, removes music and rebroadcasts, and tags every derived file with its source’s licence. We measure what each step keeps and what it throws away, and we check the thresholds against human transcripts.",
      "We will release the tools, the thresholds and the yields, so that others working on African languages can sift their own audio, and see where ours went wrong.",
    ],
    questions: [
      "How should agreement-based pseudo-labelling be calibrated when the written references themselves are inconsistent?",
      "Can real conversational structure be recovered from mono broadcast audio, and how wrong is it compared with true two-channel recordings?",
      "What does generative enhancement do to tone, hooked consonants and speaker identity?",
      "How should licence and consent restrictions travel through tokens, alignments and checkpoints so that a forbidden use is impossible?",
    ],
    ladder: [
      { state: "done", when: "Oct 2026", title: "Broadcast and spontaneous-speech pipelines built", detail: "Segmentation, two-recogniser agreement, alignment, spelling repair and licence tags. Internal." },
      { state: "now", title: "Write up what exists", detail: "The pipelines and their yields, to the release standard." },
      { state: "next", title: "Human check", detail: "A hand-labelled audit set of transcripts and word timings; thresholds re-validated." },
      { state: "next", title: "Release the tool", detail: "With the Hausa language pack and test cases." },
      { state: "next", title: "Release derivatives", detail: "Public-domain broadcast transcripts and alignments, with a data statement." },
      { state: "next", title: "Zarma pack", detail: "Apply the tool to Zarma and report what broke." },
    ],
    outputs: ["An open curation pipeline with Hausa and Zarma packs", "Curated derivatives where licences allow", "A licence-propagation schema", "Paper: sifting Hausa broadcast audio — yields, thresholds and what they cost"],
    noClaim: [
      "Our yields and thresholds are internal until they are published in a write-up with their conditions.",
      "The pipeline is not finished: word timings are provisional until hand labels exist.",
      "We do not redistribute third-party broadcast content or any source beyond its licence.",
    ],
    collaborate: "We are looking for Hausa transcribers to build the audit set, and groups curating audio in other African languages to compare methods with.",
    related: [
      { label: "CTC-Segmentation of Large Corpora — Kürzinger et al., 2020", href: "https://arxiv.org/abs/2007.09127" },
      { label: "Scaling Speech Technology to 1,000+ Languages (MMS) — Pratap et al., 2023", href: "https://arxiv.org/abs/2305.13516" },
      { label: "DNSMOS — Reddy et al., 2021", href: "https://arxiv.org/abs/2010.15258" },
      { label: "ASR-based data acquisition for Fongbe and Hausa — Adjovi et al., 2026", href: "https://arxiv.org/abs/2606.22274" },
    ],
    feeds: ["hira", "zarma"],
  },
  {
    slug: "maauni",
    name: "Maʼauni",
    title: "Honest measurement for Hausa and Zarma speech",
    status: "Active",
    sentence: "Test sets, text normalisation, listening protocols and benchmarks that make a Hausa or Zarma result mean something.",
    question: "When is a Hausa word error rate worth trusting?",
    description: [
      "A word error rate for Hausa can change without the model changing at all. One scorer treats the apostrophe in saʼa as a space. Another deletes numbers. A transcript writes kasa where the speaker said ƙasa. A test set that is 620 of 621 women cannot tell you how a model hears men, and one recorded in Nigeria cannot tell you how it hears Niger. Most published Hausa numbers come without these conditions, so they cannot be compared, and they can flatter.",
      "Maʼauni is our measurement programme. We will publish a versioned Hausa text normaliser, with test cases, that keeps the hooked letters ɓ ɗ ƙ ƴ as the distinct sounds they are. Every result we report will come twice, strict and folded, so readers can see how much depends on spelling. We are building speaker-disjoint test sets that say which dialects, genders and phone conditions they contain, and which claims they cannot support. We run blind, randomised listening tests with native speakers, and we will report how much the listeners agreed.",
      "A number we publish will always come with its conditions. When we cannot measure something, we will say so.",
    ],
    questions: [
      "What is a correct, versioned Hausa and Zarma text normaliser for scoring, and how much do published results move between toolchains on the same outputs?",
      "What test sets would support dialect, gender and channel claims for Niger and Nigeria, and how small can each cell be?",
      "How should tone and vowel length be evaluated in synthesised speech when the spelling does not mark them?",
      "How reliable are automatic judges against native listeners for Hausa?",
    ],
    ladder: [
      { state: "done", when: "Oct 2026", title: "Hausa normaliser in code", detail: "Strict and folded forms, apostrophe unification, hooked-letter repair. Internal; v1 to be published." },
      { state: "done", when: "Oct 2026", title: "Blind listening-test toolchain", detail: "Randomised rating pages with agreement statistics. Internal." },
      { state: "now", title: "Normaliser v1", detail: "Published with test cases; this site’s explainer will run on the same code." },
      { state: "next", title: "Re-scoring note", detail: "Open Hausa models on public test sets under several normalisers, strict and folded." },
      { state: "next", title: "Listening protocol v1", detail: "Multi-rater, dialect-recorded, pre-registered; agreement published." },
      { state: "next", title: "Test set v1", detail: "From Rumbu, with its cells and suppression rules stated." },
      { state: "next", title: "Benchmarks", detail: "Codec and full-duplex, each with an evaluation card." },
    ],
    outputs: ["Maʼauni normaliser v1 (Hausa and Zarma), with a web port and test cases", "A consented test set with a data statement", "An open listening-test kit", "Paper: how much is a Hausa WER worth?"],
    noClaim: [
      "We present standards and tools, not a leaderboard.",
      "Our listening studies so far have too few raters to report agreement; we will not describe them as validated.",
      "Internal measurements appear only with their conditions, after review.",
    ],
    collaborate: "We are looking for native listeners across Hausa dialects, and researchers who want to re-score their Hausa results with a shared normaliser.",
    related: [
      { label: "FLEURS — Conneau et al., 2022", href: "https://arxiv.org/abs/2205.12446" },
      { label: "Whisper (and its text normaliser) — Radford et al., 2022", href: "https://arxiv.org/abs/2212.04356" },
      { label: "Stuck in the MOS pit — Kirkland et al., SSW 2023", href: "https://www.isca-archive.org/ssw_2023/kirkland23_ssw.html" },
      { label: "Model Cards for Model Reporting — Mitchell et al., 2019", href: "https://arxiv.org/abs/1810.03993" },
    ],
    feeds: ["hira", "zarma", "rumbu", "tankade"],
  },
];

export const programmeBySlug = (slug: string) => programmes.find(p => p.slug === slug);
