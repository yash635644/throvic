/** Concept categories: colours for the graph, legend and panels (shared by server and client). */

export const CATEGORIES = {
  // The original Throvic palette, extended to nine categories.
  science: { label: "Science", color: "#7f77dd" },
  technology: { label: "Technology", color: "#85b7eb" },
  nature: { label: "Nature", color: "#97c459" },
  history: { label: "History", color: "#5dcaa5" },
  people: { label: "People", color: "#e9a3c9" },
  ideas: { label: "Ideas", color: "#ef9f27" },
  culture: { label: "Culture", color: "#f0997b" },
  society: { label: "Society & places", color: "#d2c27c" },
  other: { label: "Other", color: "#afa9ec" },
} as const;

export type Category = keyof typeof CATEGORIES;

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

const SYNONYMS: Record<string, Category> = {
  math: "science", mathematics: "science", physics: "science", chemistry: "science", astronomy: "science", biology: "nature",
  medicine: "science", computing: "technology", engineering: "technology", tech: "technology", environment: "nature",
  animal: "nature", plant: "nature", person: "people", biography: "people", philosophy: "ideas", concept: "ideas",
  idea: "ideas", religion: "ideas", art: "culture", music: "culture", literature: "culture", film: "culture",
  place: "society", places: "society", geography: "society", politics: "society", economics: "society", law: "society",
};

export function normalizeCategory(value: unknown): Category {
  const v = String(value || "").toLowerCase().trim();
  if (v in CATEGORIES) return v as Category;
  for (const [word, cat] of Object.entries(SYNONYMS)) if (v.includes(word)) return cat;
  return "other";
}

const GUESSES: [RegExp, Category][] = [
  [/\b(born|died|\(\d{4}\s*[–-]|physicist|chemist|philosopher|writer|poet|painter|composer|musician|singer|actor|actress|politician|emperor|king|queen|scientist|mathematician|engineer|inventor|explorer|novelist|author)\b/i, "people"],
  [/\b(species|genus|family of|plant|animal|mammal|bird|fish|insect|fungus|fungi|bacteri|ecosystem|organism|biome|tree|flower)\b/i, "nature"],
  [/\b(software|programming|computer|algorithm|technology|device|machine|engine|vehicle|aircraft|spacecraft|internet|network|protocol|electronic)\b/i, "technology"],
  [/(philosoph|religio|belief|ethic|doctrine|school of thought|ideolog|\blogic|metaphys|epistemolog|theolog|spiritual)/i, "ideas"],
  [/\b(war|battle|empire|dynasty|revolution|century|ancient|medieval|era|period|kingdom|civili[sz]ation)\b/i, "history"],
  [/\b(music|genre|film|novel|painting|art|artistic|literature|poem|album|song|dance|architecture style|cuisine|sport)\b/i, "culture"],
  [/\b(city|country|capital|river|mountain|region|state|province|island|lake|ocean|continent|political|economic|government|law|organization|company)\b/i, "society"],
  [/(physic|chemi|mathemat|astronom|scien|particle|equation|theorem|element|molecul|quantum|\bcells?\b|\bgenes?\b|protein|\bstars?\b|planet|galax|spacetime|universe|electromagnet|radiation|energy|\bforce\b|\bmatter\b|\bmass\b|atom|geometr|algebra|statistic|medic|disease)/i, "science"],
];

/** Best guess from a short Wikipedia description, for graphs built without AI. */
export function guessCategory(description = ""): Category {
  for (const [re, cat] of GUESSES) if (re.test(description)) return cat;
  return "other";
}
