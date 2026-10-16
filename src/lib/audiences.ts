/**
 * Audience pages (/students, /researchers, /creators, /curious). Every feature listed here exists in
 * Throvic today — no promises of future features.
 */

export type AudienceSlug = "students" | "researchers" | "creators" | "curious";
export type FeatureIcon = "verified" | "levels" | "pdf" | "outline" | "share" | "phone" | "crosslinks" | "json" | "fold" | "layouts" | "image" | "newmap" | "surprise" | "stream" | "trail" | "photos";

export interface Audience {
  slug: AudienceSlug;
  label: string;
  /** Header menu blurb. */
  short: string;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  intro: string;
  color: string;
  uses: { title: string; text: string }[];
  features: { icon: FeatureIcon; title: string; text: string }[];
  workflow: { title: string; text: string }[];
  starters: string[];
}

export const AUDIENCES: Audience[] = [
  {
    slug: "students",
    label: "Students",
    short: "Exam syllabus as connected maps",
    title: "For Students & Exam Aspirants — Syllabus as Knowledge Maps",
    description: "Study UPSC, SSC, banking, railways, defence and state PSC syllabus topics as interactive knowledge maps, verified on Wikipedia — with daily current affairs on Gathered.",
    eyebrow: "For students & aspirants",
    headline: "Learn the syllabus",
    headlineAccent: "as a map.",
    intro: "",
    color: "#7f77dd",
    uses: [],
    features: [
      { icon: "verified", title: "Verified facts", text: "Every concept is matched to its Wikipedia article, with a summary and a source link to read more." },
      { icon: "levels", title: "Your level of detail", text: "Switch explanations between simple, standard and expert — from first read to final revision." },
      { icon: "pdf", title: "PDF study sheets", text: "Download any map as a PDF: the map on page one, then every concept with its summary and source." },
      { icon: "outline", title: "Outline for revision", text: "Turn the map into a clean, foldable outline to revise topic by topic." },
      { icon: "share", title: "Share with your group", text: "Send a link or a designed image of a map to your study group on WhatsApp or Telegram." },
      { icon: "phone", title: "Study on your phone", text: "Pinch, drag and tap on any phone or tablet — no app or account needed." },
    ],
    workflow: [],
    starters: [],
  },
  {
    slug: "researchers",
    label: "Researchers",
    short: "Find connections across fields",
    title: "For Researchers — Map a Field and Its Connections",
    description: "Scope a research area as an interactive knowledge graph: key concepts, people and adjacent fields, each verified on Wikipedia, with source links and data export.",
    eyebrow: "For researchers",
    headline: "See the shape",
    headlineAccent: "of a field.",
    intro: "Start from any concept and map its neighbourhood — the theories, people, methods and adjacent fields around it. Each concept links to its source, and the whole map exports as data.",
    color: "#5dcaa5",
    uses: [
      { title: "Scope a new area", text: "Get a first map of an unfamiliar field in seconds, then expand the parts that matter to your question." },
      { title: "Spot cross-field links", text: "Expanding a concept adds connections back into your map, revealing overlaps that a list of papers hides." },
      { title: "Build a reading list", text: "Every verified concept carries its Wikipedia link — a quick starting point for references and further reading." },
    ],
    features: [
      { icon: "crosslinks", title: "Cross-links, not just branches", text: "New concepts are linked to anything already on your map, so related ideas from different fields meet." },
      { icon: "verified", title: "Source for every concept", text: "Each concept is checked against Wikipedia and shows its summary and link; unmatched ones are clearly marked." },
      { icon: "levels", title: "Expert explanations", text: "Switch to expert level for precise, technical summaries." },
      { icon: "json", title: "Export as JSON", text: "Download the map's concepts and links as data for your own notes, scripts or graph tools." },
      { icon: "fold", title: "Fold to focus", text: "Fold branches you've finished with and follow your path back to the main topic." },
      { icon: "pdf", title: "PDF with sources", text: "A PDF of the map plus every concept's summary and source link — handy for notes and meetings." },
    ],
    workflow: [
      { title: "Map the core", text: "Search your topic to see its key concepts and how they relate." },
      { title: "Expand the edges", text: "Open the concepts closest to your question; watch links form across fields." },
      { title: "Export what you found", text: "Save the map as JSON or a PDF with every source link." },
    ],
    starters: ["CRISPR", "Quantum entanglement", "Game theory", "Climate change", "Artificial intelligence", "Dark matter", "Placebo", "Plate tectonics"],
  },
  {
    slug: "creators",
    label: "Creators",
    short: "Outline lessons, scripts and worlds",
    title: "For Creators, Teachers & Writers — Outline Ideas as Maps",
    description: "Outline lessons, videos, articles and stories as knowledge maps, then share them as designed images for X, LinkedIn, Instagram and WhatsApp, or as PDF handouts.",
    eyebrow: "For creators, teachers & writers",
    headline: "Map the territory,",
    headlineAccent: "then tell the story.",
    intro: "Before a lesson, a video, a thread or a chapter, see everything around your subject on one screen. Pick the threads worth telling — and share the map itself as content.",
    color: "#ef9f27",
    uses: [
      { title: "Plan a lesson or video", text: "Lay out a topic's key ideas and the links between them, then decide the order to teach them." },
      { title: "Find your angle", text: "Expand side concepts to discover the surprising connection that makes a piece interesting." },
      { title: "Publish the map", text: "Turn the map into a ready-made image for social media or a PDF handout for a class." },
    ],
    features: [
      { icon: "image", title: "Social-ready images", text: "Designed share cards in landscape, square and story formats for X, LinkedIn, Instagram and WhatsApp." },
      { icon: "pdf", title: "PDF handouts", text: "Give students or readers the map plus a one-page summary of every concept." },
      { icon: "layouts", title: "Tree layout for outlines", text: "Switch from web to tree or radial layout to see a topic as a clean hierarchy." },
      { icon: "levels", title: "Write for your audience", text: "Simple, standard or expert explanations — match the depth to who you're creating for." },
      { icon: "newmap", title: "Spin off a series", text: "Start a new map from any concept to plan the next lesson, episode or chapter." },
      { icon: "verified", title: "Fact-checked starting points", text: "Every concept links to its Wikipedia article, so your research starts on solid ground." },
    ],
    workflow: [
      { title: "Map your subject", text: "Search the topic you're creating about." },
      { title: "Choose the threads", text: "Expand the concepts that fit your story and fold the rest away." },
      { title: "Share or hand out", text: "Export a social image, a full-map PNG or a PDF handout." },
    ],
    starters: ["Roman Empire", "Renaissance", "Silk Road", "Greek mythology", "Impressionism", "Space exploration", "Jazz", "Mughal Empire"],
  },
  {
    slug: "curious",
    label: "The curious",
    short: "A rabbit hole you can see",
    title: "For the Curious — Explore Any Rabbit Hole",
    description: "Start anywhere — black holes, fungi, jazz — and follow the connections as far as you like. Free, no sign-up, with every concept verified on Wikipedia.",
    eyebrow: "For the endlessly curious",
    headline: "Start anywhere.",
    headlineAccent: "End up somewhere amazing.",
    intro: "Jazz leads to the blues, the blues to West African music, and on it goes. Throvic draws the trail as you follow it, so you can always see where you've been — and where to go next.",
    color: "#85b7eb",
    uses: [
      { title: "Fall down a rabbit hole", text: "Tap a concept, expand it, and keep going — every step adds new branches." },
      { title: "Understand the news", text: "Look up something you just heard about and see the context around it in seconds." },
      { title: "Learn something new daily", text: "Hit Surprise me for a random topic and see how it connects to everything else." },
    ],
    features: [
      { icon: "surprise", title: "Surprise me", text: "One tap picks a random topic to explore — from tardigrades to the Silk Road." },
      { icon: "stream", title: "Watch it unfold", text: "Concepts appear one by one as they're found, so the map builds in front of you." },
      { icon: "photos", title: "Photos and summaries", text: "Every concept shows its Wikipedia photo and a short, readable summary." },
      { icon: "trail", title: "Your trail, remembered", text: "Breadcrumbs show your path back to where you started; recent topics are saved on your device." },
      { icon: "phone", title: "Made for your phone", text: "Explore with a thumb: tap, pinch, swipe the details sheet." },
      { icon: "share", title: "Share the wonder", text: "Send a friend the link or a beautiful image of your map." },
    ],
    workflow: [
      { title: "Pick a spark", text: "Type anything, or tap Surprise me." },
      { title: "Follow a thread", text: "Tap what catches your eye and expand it." },
      { title: "Keep going", text: "Every concept can become a new map of its own." },
    ],
    starters: ["Bioluminescence", "Tardigrade", "Fibonacci sequence", "Butterfly effect", "Black hole", "Origami", "Chess", "Mycology"],
  },
];

export const audienceBySlug = (slug: AudienceSlug) => AUDIENCES.find((a) => a.slug === slug)!;
