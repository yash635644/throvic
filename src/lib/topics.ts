import type { Category } from "./categories";

/** Starter topics for the landing page and the explorer's empty state. */
export const STARTER_TOPICS: { title: string; category: Category; hint: string }[] = [
  { title: "Black hole", category: "science", hint: "Gravity so strong light can't escape" },
  { title: "Quantum entanglement", category: "science", hint: "Spooky action at a distance" },
  { title: "Artificial intelligence", category: "technology", hint: "Machines that learn" },
  { title: "Indus Valley Civilisation", category: "history", hint: "Cities older than the pyramids" },
  { title: "Stoicism", category: "ideas", hint: "An ancient guide to a calm life" },
  { title: "CRISPR", category: "nature", hint: "Editing the code of life" },
  { title: "Jazz", category: "culture", hint: "Improvisation, swing and the blues" },
  { title: "Constitution of India", category: "society", hint: "The world's longest constitution" },
  { title: "Mycology", category: "nature", hint: "The hidden kingdom of fungi" },
  { title: "Roman Empire", category: "history", hint: "Rise, rule and fall" },
  { title: "Blockchain", category: "technology", hint: "Ledgers without a middleman" },
  { title: "Marie Curie", category: "people", hint: "Two Nobel Prizes, two sciences" },
];

export const SURPRISE_TOPICS = [
  "Fibonacci sequence", "Origami", "Dark matter", "Bioluminescence", "Renaissance", "Game theory", "Placebo",
  "Silk Road", "Plate tectonics", "Cryptography", "Impressionism", "Photosynthesis", "Chess", "Ayurveda",
  "Butterfly effect", "Mughal Empire", "Black hole", "Neural network", "Tardigrade", "Existentialism",
];
