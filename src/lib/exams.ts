import type { SubjectSlug } from "./syllabus";

/**
 * Government exams covered by Throvic's exam hub. Facts kept to what is stable and verifiable
 * (exam name and conducting body); no dates, vacancies or cut-offs, which change every cycle.
 * `gathered` is the matching current-affairs page on Gathered (sister site), which already exists.
 */

export type ExamGroup = "civil-services" | "ssc" | "banking" | "insurance" | "railways" | "defence" | "state-psc" | "state-ssb";

export interface Exam {
  slug: string;
  name: string;
  short: string;
  body: string;
  level: "central" | "state";
  group: ExamGroup;
  /** State or union territory, for state-level exams. */
  state?: string;
  subjects: SubjectSlug[];
  /** Gathered current-affairs exam page slug: /current-affairs/exam/<slug>. */
  gathered: "upsc" | "ssc" | "banking" | "railways" | "state-psc" | "defence";
}

export const GROUPS: Record<ExamGroup, { label: string; blurb: string }> = {
  "civil-services": { label: "Civil services (UPSC)", blurb: "Union Public Service Commission exams for the IAS, IPS, IFS and central services, CAPF and more." },
  ssc: { label: "Staff Selection Commission", blurb: "SSC exams for Group B and C posts in central ministries, departments and police forces." },
  banking: { label: "Banking", blurb: "Officer and clerk exams for public-sector banks, regional rural banks and the RBI." },
  insurance: { label: "Insurance & development finance", blurb: "Officer exams for public-sector insurers and development finance institutions." },
  railways: { label: "Railways", blurb: "Railway Recruitment Board exams for technical and non-technical posts." },
  defence: { label: "Defence", blurb: "Entry exams for officers of the Army, Navy and Air Force." },
  "state-psc": { label: "State Public Service Commissions", blurb: "State civil services and other gazetted posts, conducted by each state's PSC." },
  "state-ssb": { label: "State staff selection boards", blurb: "Subordinate (Group C and similar) posts in state departments." },
};

/* General-studies subject sets reused across exams. */
const GS_ALL: SubjectSlug[] = ["ancient-history", "medieval-history", "modern-history", "art-and-culture", "indian-geography", "world-geography", "polity", "economy", "environment", "science-and-technology", "international-relations"];
const STATIC_GK: SubjectSlug[] = ["ancient-history", "medieval-history", "modern-history", "art-and-culture", "indian-geography", "world-geography", "polity", "economy", "general-science", "environment"];
const BANKING: SubjectSlug[] = ["banking-awareness", "economy", "international-relations", "polity"];
const DEFENCE: SubjectSlug[] = ["modern-history", "ancient-history", "indian-geography", "world-geography", "polity", "economy", "general-science", "science-and-technology", "international-relations"];
const RAILWAYS: SubjectSlug[] = ["general-science", "modern-history", "ancient-history", "indian-geography", "polity", "economy", "science-and-technology"];

const central = (e: Omit<Exam, "level">): Exam => ({ ...e, level: "central" });

export const CENTRAL_EXAMS: Exam[] = [
  central({ slug: "upsc-civil-services", name: "UPSC Civil Services Examination", short: "UPSC CSE", body: "Union Public Service Commission", group: "civil-services", subjects: GS_ALL, gathered: "upsc" }),
  central({ slug: "upsc-capf", name: "UPSC Central Armed Police Forces (Assistant Commandant)", short: "UPSC CAPF", body: "Union Public Service Commission", group: "civil-services", subjects: [...GS_ALL, "general-science"], gathered: "upsc" }),
  central({ slug: "upsc-nda", name: "UPSC National Defence Academy & Naval Academy Examination", short: "NDA", body: "Union Public Service Commission", group: "defence", subjects: DEFENCE, gathered: "defence" }),
  central({ slug: "upsc-cds", name: "UPSC Combined Defence Services Examination", short: "CDS", body: "Union Public Service Commission", group: "defence", subjects: DEFENCE, gathered: "defence" }),
  central({ slug: "afcat", name: "Air Force Common Admission Test", short: "AFCAT", body: "Indian Air Force", group: "defence", subjects: DEFENCE, gathered: "defence" }),
  central({ slug: "ssc-cgl", name: "SSC Combined Graduate Level Examination", short: "SSC CGL", body: "Staff Selection Commission", group: "ssc", subjects: STATIC_GK, gathered: "ssc" }),
  central({ slug: "ssc-chsl", name: "SSC Combined Higher Secondary Level Examination", short: "SSC CHSL", body: "Staff Selection Commission", group: "ssc", subjects: STATIC_GK, gathered: "ssc" }),
  central({ slug: "ssc-mts", name: "SSC Multi-Tasking (Non-Technical) Staff Examination", short: "SSC MTS", body: "Staff Selection Commission", group: "ssc", subjects: STATIC_GK, gathered: "ssc" }),
  central({ slug: "ssc-gd", name: "SSC Constable (General Duty) Examination", short: "SSC GD", body: "Staff Selection Commission", group: "ssc", subjects: STATIC_GK, gathered: "ssc" }),
  central({ slug: "ssc-cpo", name: "SSC Sub-Inspector in Delhi Police and CAPFs", short: "SSC CPO", body: "Staff Selection Commission", group: "ssc", subjects: STATIC_GK, gathered: "ssc" }),
  central({ slug: "ssc-stenographer", name: "SSC Stenographer Grade C & D Examination", short: "SSC Steno", body: "Staff Selection Commission", group: "ssc", subjects: STATIC_GK, gathered: "ssc" }),
  central({ slug: "ibps-po", name: "IBPS Probationary Officer / Management Trainee", short: "IBPS PO", body: "Institute of Banking Personnel Selection", group: "banking", subjects: BANKING, gathered: "banking" }),
  central({ slug: "ibps-clerk", name: "IBPS Clerk (Customer Service Associate)", short: "IBPS Clerk", body: "Institute of Banking Personnel Selection", group: "banking", subjects: BANKING, gathered: "banking" }),
  central({ slug: "ibps-rrb", name: "IBPS Regional Rural Banks (Officer Scale I & Office Assistant)", short: "IBPS RRB", body: "Institute of Banking Personnel Selection", group: "banking", subjects: BANKING, gathered: "banking" }),
  central({ slug: "ibps-so", name: "IBPS Specialist Officer", short: "IBPS SO", body: "Institute of Banking Personnel Selection", group: "banking", subjects: BANKING, gathered: "banking" }),
  central({ slug: "sbi-po", name: "SBI Probationary Officer", short: "SBI PO", body: "State Bank of India", group: "banking", subjects: BANKING, gathered: "banking" }),
  central({ slug: "sbi-clerk", name: "SBI Clerk (Junior Associate)", short: "SBI Clerk", body: "State Bank of India", group: "banking", subjects: BANKING, gathered: "banking" }),
  central({ slug: "rbi-grade-b", name: "RBI Grade B Officer", short: "RBI Grade B", body: "Reserve Bank of India", group: "banking", subjects: [...BANKING, "environment"], gathered: "banking" }),
  central({ slug: "rbi-assistant", name: "RBI Assistant", short: "RBI Assistant", body: "Reserve Bank of India", group: "banking", subjects: BANKING, gathered: "banking" }),
  central({ slug: "lic-aao", name: "LIC Assistant Administrative Officer", short: "LIC AAO", body: "Life Insurance Corporation of India", group: "insurance", subjects: BANKING, gathered: "banking" }),
  central({ slug: "nabard-grade-a", name: "NABARD Grade A (Assistant Manager)", short: "NABARD Grade A", body: "National Bank for Agriculture and Rural Development", group: "insurance", subjects: [...BANKING, "environment", "indian-geography"], gathered: "banking" }),
  central({ slug: "rrb-ntpc", name: "RRB Non-Technical Popular Categories", short: "RRB NTPC", body: "Railway Recruitment Boards", group: "railways", subjects: RAILWAYS, gathered: "railways" }),
  central({ slug: "rrb-group-d", name: "RRB Group D (Level 1 posts)", short: "RRB Group D", body: "Railway Recruitment Boards", group: "railways", subjects: RAILWAYS, gathered: "railways" }),
  central({ slug: "rrb-alp", name: "RRB Assistant Loco Pilot", short: "RRB ALP", body: "Railway Recruitment Boards", group: "railways", subjects: RAILWAYS, gathered: "railways" }),
  central({ slug: "rrb-je", name: "RRB Junior Engineer", short: "RRB JE", body: "Railway Recruitment Boards", group: "railways", subjects: RAILWAYS, gathered: "railways" }),
];

/* State Public Service Commissions (state civil services). */
const PSC: [slug: string, state: string, body: string, short: string][] = [
  ["appsc", "Andhra Pradesh", "Andhra Pradesh Public Service Commission", "APPSC"],
  ["arunachal-psc", "Arunachal Pradesh", "Arunachal Pradesh Public Service Commission", "Arunachal PSC"],
  ["apsc", "Assam", "Assam Public Service Commission", "APSC"],
  ["bpsc", "Bihar", "Bihar Public Service Commission", "BPSC"],
  ["cgpsc", "Chhattisgarh", "Chhattisgarh Public Service Commission", "CGPSC"],
  ["goa-psc", "Goa", "Goa Public Service Commission", "Goa PSC"],
  ["gpsc", "Gujarat", "Gujarat Public Service Commission", "GPSC"],
  ["hpsc", "Haryana", "Haryana Public Service Commission", "HPSC"],
  ["hppsc", "Himachal Pradesh", "Himachal Pradesh Public Service Commission", "HPPSC"],
  ["jkpsc", "Jammu and Kashmir", "Jammu and Kashmir Public Service Commission", "JKPSC"],
  ["jpsc", "Jharkhand", "Jharkhand Public Service Commission", "JPSC"],
  ["kpsc", "Karnataka", "Karnataka Public Service Commission", "KPSC"],
  ["kerala-psc", "Kerala", "Kerala Public Service Commission", "Kerala PSC"],
  ["mppsc", "Madhya Pradesh", "Madhya Pradesh Public Service Commission", "MPPSC"],
  ["mpsc", "Maharashtra", "Maharashtra Public Service Commission", "MPSC"],
  ["manipur-psc", "Manipur", "Manipur Public Service Commission", "Manipur PSC"],
  ["meghalaya-psc", "Meghalaya", "Meghalaya Public Service Commission", "Meghalaya PSC"],
  ["mizoram-psc", "Mizoram", "Mizoram Public Service Commission", "Mizoram PSC"],
  ["npsc", "Nagaland", "Nagaland Public Service Commission", "NPSC"],
  ["opsc", "Odisha", "Odisha Public Service Commission", "OPSC"],
  ["ppsc", "Punjab", "Punjab Public Service Commission", "PPSC"],
  ["rpsc", "Rajasthan", "Rajasthan Public Service Commission", "RPSC"],
  ["sikkim-psc", "Sikkim", "Sikkim Public Service Commission", "Sikkim PSC"],
  ["tnpsc", "Tamil Nadu", "Tamil Nadu Public Service Commission", "TNPSC"],
  ["tgpsc", "Telangana", "Telangana Public Service Commission (formerly TSPSC)", "TGPSC"],
  ["tpsc", "Tripura", "Tripura Public Service Commission", "TPSC"],
  ["uppsc", "Uttar Pradesh", "Uttar Pradesh Public Service Commission", "UPPSC"],
  ["ukpsc", "Uttarakhand", "Uttarakhand Public Service Commission", "UKPSC"],
  ["wbpsc", "West Bengal", "West Bengal Public Service Commission", "WBPSC"],
];

/* State staff selection boards (subordinate services). */
const SSB: [slug: string, state: string, body: string, short: string][] = [
  ["gsssb", "Gujarat", "Gujarat Subordinate Service Selection Board", "GSSSB"],
  ["upsssc", "Uttar Pradesh", "Uttar Pradesh Subordinate Services Selection Commission", "UPSSSC"],
  ["rssb", "Rajasthan", "Rajasthan Staff Selection Board (formerly RSMSSB)", "RSSB"],
  ["dsssb", "Delhi", "Delhi Subordinate Services Selection Board", "DSSSB"],
  ["mpesb", "Madhya Pradesh", "Madhya Pradesh Employees Selection Board", "MPESB"],
  ["bssc", "Bihar", "Bihar Staff Selection Commission", "BSSC"],
  ["hssc", "Haryana", "Haryana Staff Selection Commission", "HSSC"],
  ["ossc", "Odisha", "Odisha Staff Selection Commission", "OSSC"],
  ["jssc", "Jharkhand", "Jharkhand Staff Selection Commission", "JSSC"],
  ["psssb", "Punjab", "Punjab Subordinate Service Selection Board", "PSSSB"],
];

export const STATE_EXAMS: Exam[] = [
  ...PSC.map(([slug, state, body, short]) => ({
    slug,
    name: `${short} State Civil Services Examination`,
    short,
    body,
    level: "state" as const,
    group: "state-psc" as const,
    state,
    subjects: [...GS_ALL, "state-studies" as SubjectSlug],
    gathered: "state-psc" as const,
  })),
  ...SSB.map(([slug, state, body, short]) => ({
    slug,
    name: `${short} recruitment examinations`,
    short,
    body,
    level: "state" as const,
    group: "state-ssb" as const,
    state,
    subjects: [...STATIC_GK, "state-studies" as SubjectSlug],
    gathered: "state-psc" as const,
  })),
];

export const EXAMS: Exam[] = [...CENTRAL_EXAMS, ...STATE_EXAMS];

export const examBySlug = (slug: string) => EXAMS.find((e) => e.slug === slug);
export const examsWithSubject = (subject: SubjectSlug) => EXAMS.filter((e) => e.subjects.includes(subject));
export const STATES = [...new Set(STATE_EXAMS.map((e) => e.state!))].sort();

/** Display names for Gathered's exam current-affairs pages. */
export const GATHERED_LABEL: Record<Exam["gathered"], string> = {
  upsc: "UPSC",
  ssc: "SSC",
  banking: "Banking",
  railways: "Railways",
  "state-psc": "State PSC",
  defence: "Defence",
};

/** Gathered (sister site) pages that already exist and suit each exam. */
export const GATHERED = {
  base: "https://gathered.pages.dev",
  examCurrentAffairs: (slug: Exam["gathered"]) => `https://gathered.pages.dev/current-affairs/exam/${slug}`,
  upscStudyCards: "https://gathered.pages.dev/upsc-current-affairs",
  mainsQuestions: "https://gathered.pages.dev/upsc-current-affairs/mains-questions",
  constitution: "https://gathered.pages.dev/constitution",
  quiz: "https://gathered.pages.dev/current-affairs/quiz",
  importantDays: "https://gathered.pages.dev/important-days",
  onThisDay: "https://gathered.pages.dev/on-this-day",
  todayCurrentAffairs: "https://gathered.pages.dev/current-affairs",
};
