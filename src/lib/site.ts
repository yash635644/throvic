/** Brand, URLs and SEO settings shared by server and client code. */

export const SITE = {
  name: "Throvic",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://throvic.pages.dev").replace(/\/+$/, ""),
  tagline: "The thrill of knowing more",
  /** <title> for the home page — under 60 characters so it isn't cut off in Google. */
  title: "Throvic — AI Knowledge Graph & Mind Map Explorer",
  /** Meta description — about 150 characters. */
  description:
    "Turn any topic into an interactive knowledge graph — key ideas, people and events, each verified on Wikipedia. A free AI mind map for students and aspirants.",
  keywords: [
    "knowledge graph",
    "AI mind map",
    "mind map generator",
    "concept map",
    "topic explorer",
    "study tool",
    "UPSC preparation",
    "visual learning",
    "Wikipedia",
    "Throvic",
  ],
  locale: "en_IN",
  language: "en-IN",
  themeColor: "#0d0d14",
  formspreeId: process.env.NEXT_PUBLIC_FORMSPREE_ID || "mzdyypdp",
  gaId: process.env.NEXT_PUBLIC_GA_ID || "",
  /** Founder. Same @id and details as the portfolio site and Gathered, so all three describe one person. */
  founder: {
    name: "Yash Trivedi",
    url: "https://yash635644.github.io/yash-portfolio/",
    id: "https://yash635644.github.io/yash-portfolio/#person",
    jobTitle: "AI Automation & SEO Specialist",
    city: "Ahmedabad",
    region: "Gujarat",
    country: "IN",
    sameAs: ["https://in.linkedin.com/in/yash-trivedii", "https://github.com/yash635644", "https://ink-inspired.blogspot.com/"],
  },
  /** Sister project by the same founder (daily current affairs, UPSC study cards, Constitution of India). */
  gathered: {
    name: "Gathered",
    url: "https://gathered.pages.dev/",
    id: "https://gathered.pages.dev/#organization",
    blurb: "Daily news, current affairs and UPSC study cards",
  },
  /** Sister project by the same creator. */
  cyberKavach: {
    name: "Cyber Kavach",
    url: "https://cyber-kavach.vercel.app/",
    blurb: "Free scam checker for SMS, WhatsApp, links and UPI",
  },
} as const;

export const absoluteUrl = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

export const exploreUrl = (topic: string) => `/explore?q=${encodeURIComponent(topic)}`;
