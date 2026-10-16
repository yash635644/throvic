import { slugify } from "./keys";

/**
 * Exam syllabus subjects and their topics. Every topic is an English Wikipedia article title, so each
 * topic page is grounded in a verified source. These are the pages that get indexed (/topic/<slug>);
 * anything else stays in the explorer.
 */

export type SubjectSlug =
  | "ancient-history"
  | "medieval-history"
  | "modern-history"
  | "art-and-culture"
  | "indian-geography"
  | "world-geography"
  | "polity"
  | "economy"
  | "environment"
  | "science-and-technology"
  | "international-relations"
  | "banking-awareness"
  | "general-science"
  | "state-studies";

export interface Subject {
  slug: SubjectSlug;
  name: string;
  /** One line for cards and meta descriptions. */
  blurb: string;
  color: string;
  topics: string[];
}

export const SUBJECTS: Subject[] = [
  {
    slug: "ancient-history",
    name: "Ancient Indian History",
    blurb: "From the Indus Valley to the Guptas — civilisations, empires and religions of early India.",
    color: "#5dcaa5",
    topics: ["Indus Valley Civilisation", "Vedic period", "Mahajanapadas", "Buddhism", "Jainism", "Maurya Empire", "Ashoka", "Gupta Empire", "Sangam period", "Kushan Empire", "Satavahana dynasty", "Chola dynasty", "Pallava dynasty", "Harsha"],
  },
  {
    slug: "medieval-history",
    name: "Medieval Indian History",
    blurb: "Sultanates, the Mughals, Vijayanagara and the Marathas — power and culture from 700 to 1750.",
    color: "#5dcaa5",
    topics: ["Delhi Sultanate", "Mughal Empire", "Akbar", "Vijayanagara Empire", "Krishnadevaraya", "Bahmani Sultanate", "Bhakti movement", "Sufism", "Maratha Empire", "Shivaji", "Sikhism", "Rajput"],
  },
  {
    slug: "modern-history",
    name: "Modern Indian History",
    blurb: "Company rule, the national movement and independence — the story from 1757 to 1947.",
    color: "#5dcaa5",
    topics: ["East India Company", "Indian Rebellion of 1857", "Indian National Congress", "Partition of Bengal (1905)", "Swadeshi movement", "Jallianwala Bagh massacre", "Non-cooperation movement", "Simon Commission", "Salt March", "Civil disobedience movement", "Government of India Act 1935", "Quit India Movement", "Mahatma Gandhi", "Jawaharlal Nehru", "Subhas Chandra Bose", "Bhagat Singh", "B. R. Ambedkar", "Vallabhbhai Patel", "Partition of India", "Indian independence movement"],
  },
  {
    slug: "art-and-culture",
    name: "Indian Art & Culture",
    blurb: "Dance, music, architecture and painting traditions that appear across GS and general awareness papers.",
    color: "#f0997b",
    topics: ["Indian classical dance", "Bharatanatyam", "Kathak", "Kathakali", "Hindustani classical music", "Carnatic music", "Ajanta Caves", "Ellora Caves", "Dravidian architecture", "Indo-Islamic architecture", "Madhubani art", "Konark Sun Temple"],
  },
  {
    slug: "indian-geography",
    name: "Indian Geography",
    blurb: "Physiography, rivers, climate, resources and agriculture of India.",
    color: "#d2c27c",
    topics: ["Geography of India", "Himalayas", "Indo-Gangetic Plain", "Deccan Plateau", "Western Ghats", "Eastern Ghats", "Thar Desert", "Climate of India", "Monsoon", "Ganges", "Brahmaputra River", "Godavari River", "Agriculture in India", "Mining in India"],
  },
  {
    slug: "world-geography",
    name: "Physical & World Geography",
    blurb: "How the Earth works — landforms, atmosphere, oceans and climate systems.",
    color: "#d2c27c",
    topics: ["Plate tectonics", "Earthquake", "Volcano", "Atmosphere of Earth", "Ocean current", "El Niño–Southern Oscillation", "Tropical cyclone", "Rock (geology)", "Weathering", "Biome", "Latitude", "Time zone"],
  },
  {
    slug: "polity",
    name: "Indian Polity & Constitution",
    blurb: "The Constitution, institutions and governance of India.",
    color: "#7f77dd",
    topics: ["Constitution of India", "Preamble to the Constitution of India", "Fundamental rights in India", "Directive Principles of State Policy", "Fundamental Duties (India)", "Parliament of India", "Lok Sabha", "Rajya Sabha", "President of India", "Prime Minister of India", "Supreme Court of India", "Governor (India)", "Election Commission of India", "Comptroller and Auditor General of India", "Panchayati raj in India", "Basic structure doctrine", "Emergency (India)", "Amendment of the Constitution of India"],
  },
  {
    slug: "economy",
    name: "Indian Economy",
    blurb: "Growth, money, budgets, planning and reforms of the Indian economy.",
    color: "#ef9f27",
    topics: ["Economy of India", "Reserve Bank of India", "Monetary policy", "Inflation", "Gross domestic product", "Goods and Services Tax (India)", "Union budget of India", "Five-Year Plans of India", "NITI Aayog", "Green Revolution in India", "Economic liberalisation in India", "Securities and Exchange Board of India", "Balance of payments", "Foreign direct investment", "Poverty in India"],
  },
  {
    slug: "environment",
    name: "Environment & Ecology",
    blurb: "Ecosystems, biodiversity, climate change and India's conservation laws and programmes.",
    color: "#97c459",
    topics: ["Ecosystem", "Biodiversity", "Climate change", "Paris Agreement", "Kyoto Protocol", "Ramsar Convention", "Ozone depletion", "Project Tiger", "National parks of India", "Biosphere reserves of India", "Wildlife Protection Act, 1972", "Renewable energy in India", "Air pollution in India", "Sustainable development"],
  },
  {
    slug: "science-and-technology",
    name: "Science & Technology",
    blurb: "Space, nuclear, bio- and digital technologies, and India's achievements in each.",
    color: "#85b7eb",
    topics: ["Indian Space Research Organisation", "Chandrayaan-3", "Nuclear power in India", "Biotechnology", "CRISPR", "Vaccine", "Artificial intelligence", "Blockchain", "Quantum computing", "Semiconductor", "5G", "Nanotechnology"],
  },
  {
    slug: "international-relations",
    name: "International Relations",
    blurb: "India's foreign policy and the international groupings and institutions it works with.",
    color: "#e9a3c9",
    topics: ["Foreign relations of India", "United Nations", "Non-Aligned Movement", "Panchsheel", "BRICS", "G20", "Shanghai Cooperation Organisation", "South Asian Association for Regional Cooperation", "Quadrilateral Security Dialogue", "Act East policy", "World Trade Organization"],
  },
  {
    slug: "banking-awareness",
    name: "Banking & Financial Awareness",
    blurb: "Banking concepts, regulators and schemes asked in bank and insurance exams.",
    color: "#ef9f27",
    topics: ["Banking in India", "Reserve Bank of India", "Repurchase agreement", "Cash reserve ratio", "Statutory liquidity ratio", "Non-performing asset", "Basel III", "Unified Payments Interface", "Financial inclusion", "Pradhan Mantri Jan Dhan Yojana", "NABARD", "Payments bank", "Small finance bank"],
  },
  {
    slug: "general-science",
    name: "General Science",
    blurb: "Everyday physics, chemistry and biology for SSC, railways and defence exams.",
    color: "#85b7eb",
    topics: ["Newton's laws of motion", "Light", "Electricity", "Magnetism", "Sound", "Periodic table", "Acid", "Chemical reaction", "Cell (biology)", "Human digestive system", "Circulatory system", "Vitamin", "Photosynthesis", "Infection"],
  },
  {
    slug: "state-studies",
    name: "State Studies",
    blurb: "History, geography, culture, economy and politics of each state — asked in every state exam.",
    color: "#afa9ec",
    topics: [],
  },
];

/** The state-specific topics (Wikipedia has a "History of X", "Geography of X"… article for each state). */
export const STATE_ASPECTS = ["History", "Geography", "Culture", "Economy", "Politics"] as const;
export const stateTopics = (state: string) => STATE_ASPECTS.map((a) => `${a} of ${state}`);

export const subjectBySlug = (slug: string) => SUBJECTS.find((s) => s.slug === slug);

export interface TopicEntry {
  slug: string;
  title: string;
  subject: SubjectSlug;
  /** Set for state-studies topics. */
  state?: string;
}

/** Every indexable topic, keyed by slug (a topic can sit in more than one subject; the first wins). */
export function topicRegistry(states: string[]): Map<string, TopicEntry> {
  const map = new Map<string, TopicEntry>();
  for (const s of SUBJECTS) for (const title of s.topics) if (!map.has(slugify(title))) map.set(slugify(title), { slug: slugify(title), title, subject: s.slug });
  for (const state of states) for (const title of stateTopics(state)) if (!map.has(slugify(title))) map.set(slugify(title), { slug: slugify(title), title, subject: "state-studies", state });
  return map;
}

export const topicHref = (title: string) => `/topic/${slugify(title)}`;
