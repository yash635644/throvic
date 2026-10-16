/**
 * Structure of the Constitution of India for the Constitution map. Hand-written, not AI-generated:
 * Parts with their article ranges, the Schedules, and well-known articles. Every item links to its
 * page in Gathered's Constitution section (URL patterns verified against the live site).
 */

const G = "https://gathered.pages.dev/constitution";

export interface CPart {
  id: string; // roman numeral, e.g. "III", "IVA"
  title: string;
  articles: string;
  note?: string;
  /** Throvic topic page for the subject, when there is one. */
  topic?: string;
}

export const PARTS: CPart[] = [
  { id: "I", title: "The Union and its Territory", articles: "1–4" },
  { id: "II", title: "Citizenship", articles: "5–11" },
  { id: "III", title: "Fundamental Rights", articles: "12–35", topic: "Fundamental rights in India" },
  { id: "IV", title: "Directive Principles of State Policy", articles: "36–51", topic: "Directive Principles of State Policy" },
  { id: "IVA", title: "Fundamental Duties", articles: "51A", topic: "Fundamental Duties (India)" },
  { id: "V", title: "The Union", articles: "52–151", topic: "Parliament of India" },
  { id: "VI", title: "The States", articles: "152–237", topic: "Governor (India)" },
  { id: "VII", title: "States in Part B of the First Schedule", articles: "238", note: "Repealed by the Constitution (Seventh Amendment) Act, 1956." },
  { id: "VIII", title: "The Union Territories", articles: "239–242" },
  { id: "IX", title: "The Panchayats", articles: "243–243O", topic: "Panchayati raj in India" },
  { id: "IXA", title: "The Municipalities", articles: "243P–243ZG" },
  { id: "IXB", title: "The Co-operative Societies", articles: "243ZH–243ZT" },
  { id: "X", title: "The Scheduled and Tribal Areas", articles: "244–244A" },
  { id: "XI", title: "Relations between the Union and the States", articles: "245–263" },
  { id: "XII", title: "Finance, Property, Contracts and Suits", articles: "264–300A" },
  { id: "XIII", title: "Trade, Commerce and Intercourse within the Territory of India", articles: "301–307" },
  { id: "XIV", title: "Services under the Union and the States", articles: "308–323" },
  { id: "XIVA", title: "Tribunals", articles: "323A–323B" },
  { id: "XV", title: "Elections", articles: "324–329A", topic: "Election Commission of India" },
  { id: "XVI", title: "Special Provisions relating to certain Classes", articles: "330–342A" },
  { id: "XVII", title: "Official Language", articles: "343–351" },
  { id: "XVIII", title: "Emergency Provisions", articles: "352–360", topic: "Emergency (India)" },
  { id: "XIX", title: "Miscellaneous", articles: "361–367" },
  { id: "XX", title: "Amendment of the Constitution", articles: "368", topic: "Amendment of the Constitution of India" },
  { id: "XXI", title: "Temporary, Transitional and Special Provisions", articles: "369–392" },
  { id: "XXII", title: "Short title, Commencement, Authoritative Text in Hindi and Repeals", articles: "393–395" },
];

export interface CSchedule {
  n: number;
  name: string; // "First" … "Twelfth"
  title: string;
  note?: string;
}

export const SCHEDULES: CSchedule[] = [
  { n: 1, name: "First", title: "States and Union Territories" },
  { n: 2, name: "Second", title: "Emoluments of the President, Governors, judges, the CAG and others" },
  { n: 3, name: "Third", title: "Forms of oaths and affirmations" },
  { n: 4, name: "Fourth", title: "Allocation of seats in the Rajya Sabha" },
  { n: 5, name: "Fifth", title: "Administration of Scheduled Areas and Scheduled Tribes" },
  { n: 6, name: "Sixth", title: "Tribal areas in Assam, Meghalaya, Tripura and Mizoram" },
  { n: 7, name: "Seventh", title: "Union, State and Concurrent Lists" },
  { n: 8, name: "Eighth", title: "Languages recognised by the Constitution" },
  { n: 9, name: "Ninth", title: "Validation of certain Acts and Regulations", note: "Added by the First Amendment, 1951." },
  { n: 10, name: "Tenth", title: "Disqualification on grounds of defection (anti-defection law)", note: "Added by the 52nd Amendment, 1985." },
  { n: 11, name: "Eleventh", title: "Powers of Panchayats (29 subjects)", note: "Added by the 73rd Amendment, 1992." },
  { n: 12, name: "Twelfth", title: "Powers of Municipalities (18 subjects)", note: "Added by the 74th Amendment, 1992." },
];

export interface CArticle {
  n: string; // "21", "21A", "243G"
  title: string;
  part: string; // part id
  topic?: string;
}

export const KEY_ARTICLES: CArticle[] = [
  { n: "14", title: "Equality before law", part: "III" },
  { n: "15", title: "Prohibition of discrimination", part: "III" },
  { n: "16", title: "Equality of opportunity in public employment", part: "III" },
  { n: "17", title: "Abolition of Untouchability", part: "III" },
  { n: "19", title: "Protection of freedom of speech and other rights", part: "III" },
  { n: "21", title: "Protection of life and personal liberty", part: "III" },
  { n: "21A", title: "Right to education", part: "III" },
  { n: "32", title: "Remedies for enforcement of Fundamental Rights", part: "III" },
  { n: "39A", title: "Equal justice and free legal aid", part: "IV" },
  { n: "44", title: "Uniform civil code", part: "IV" },
  { n: "51A", title: "Fundamental duties", part: "IVA" },
  { n: "72", title: "Pardoning power of the President", part: "V", topic: "President of India" },
  { n: "112", title: "Annual financial statement (Budget)", part: "V", topic: "Union budget of India" },
  { n: "123", title: "Ordinance-making power of the President", part: "V" },
  { n: "148", title: "Comptroller and Auditor-General of India", part: "V", topic: "Comptroller and Auditor General of India" },
  { n: "213", title: "Ordinance-making power of the Governor", part: "VI" },
  { n: "226", title: "Power of High Courts to issue writs", part: "VI" },
  { n: "243G", title: "Powers and responsibilities of Panchayats", part: "IX" },
  { n: "280", title: "Finance Commission", part: "XII" },
  { n: "300A", title: "Right to property (legal right)", part: "XII" },
  { n: "324", title: "Election Commission", part: "XV", topic: "Election Commission of India" },
  { n: "352", title: "Proclamation of National Emergency", part: "XVIII" },
  { n: "356", title: "President's Rule in States", part: "XVIII" },
  { n: "360", title: "Financial Emergency", part: "XVIII" },
  { n: "368", title: "Power of Parliament to amend the Constitution", part: "XX" },
];

/** Factual links between Parts and Schedules (drawn as cross-links on the map). */
export const CROSS_LINKS: { part: string; schedule: number; label: string }[] = [
  { part: "IX", schedule: 11, label: "powers listed in" },
  { part: "IXA", schedule: 12, label: "powers listed in" },
  { part: "X", schedule: 5, label: "administered under" },
  { part: "X", schedule: 6, label: "administered under" },
  { part: "XI", schedule: 7, label: "subjects divided in" },
  { part: "XVII", schedule: 8, label: "languages listed in" },
  { part: "I", schedule: 1, label: "territories listed in" },
];

export const gatheredPart = (id: string) => `${G}/part-${id.toLowerCase()}`;
export const gatheredSchedule = (name: string) => `${G}/${name.toLowerCase()}-schedule`;
export const gatheredArticle = (n: string) => `${G}/article-${n.toLowerCase()}`;
export const GATHERED_CONSTITUTION = { home: G, preamble: `${G}/preamble`, amendments: `${G}/amendments`, facts: `${G}/facts`, quiz: `${G}/quiz` };
