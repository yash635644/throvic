import type { Metadata } from "next";
import { ImageResponse } from "next/og";
import { AUDIENCES } from "./audiences";
import { EXAMS, GROUPS } from "./exams";
import { brandFonts, OG_BACKGROUND, OG_SIZE, OgBrand } from "./og";
import { SITE } from "./site";
import { SUBJECTS, subjectBySlug } from "./syllabus";

/**
 * Link-preview cards (WhatsApp, X, Facebook, LinkedIn, Telegram, Slack…) for every page except
 * topic pages, which draw their own map. All are pre-built at deploy as /og/<card>.png and served
 * as plain static files: instant for preview bots, and free on Cloudflare.
 */

export interface ShareCard {
  eyebrow: string;
  title: string;
  text: string;
  chips?: { label: string; color: string }[];
  accent?: string;
}

const PURPLE = "#8f87e8";
const TEAL = "#5dcaa5";

function cards(): Record<string, ShareCard> {
  const out: Record<string, ShareCard> = {
    home: { eyebrow: "Knowledge graph explorer", title: "The thrill of knowing more.", text: "Explore any topic as an interactive knowledge graph — every concept verified on Wikipedia." },
    explore: { eyebrow: "Explore", title: "Any topic, mapped in seconds.", text: "Type a topic, tap a concept to read, expand it to go deeper." },
    students: {
      eyebrow: "For students & aspirants",
      title: "Your syllabus, as a map.",
      text: "History, polity, geography, economy and more — with daily revision and progress for your exam.",
      chips: ["UPSC", "SSC", "Banking", "Railways", "Defence", "State PSCs"].map((label, i) => ({ label, color: [PURPLE, "#85b7eb", TEAL, "#ef9f27", "#e9a3c9", "#97c459"][i] })),
    },
    constitution: {
      eyebrow: "Constitution of India",
      title: "Every Part, Schedule and key Article — mapped.",
      text: "All 25 Parts, the 12 Schedules and landmark Articles like 14, 21, 32 and 368.",
      chips: ["Preamble", "Fundamental Rights", "DPSP", "Emergency", "Amendments"].map((label) => ({ label, color: "#d2c27c" })),
      accent: "#d2c27c",
    },
    exams: {
      eyebrow: "Government exams",
      title: `${EXAMS.length} central & state exams, topic by topic.`,
      text: "UPSC, SSC, banking, railways, defence and every state PSC and staff selection board.",
    },
    subjects: {
      eyebrow: "General studies",
      title: `${SUBJECTS.length} subjects as knowledge maps.`,
      text: "See how people, events and ideas connect — instead of memorising them in isolation.",
      chips: SUBJECTS.slice(0, 6).map((s) => ({ label: s.name.replace(/^Indian /, ""), color: s.color })),
    },
    "mind-map-generator": {
      eyebrow: "Free AI mind map generator",
      title: "Any topic, mapped in seconds.",
      text: "Interactive mind maps of key ideas, people and events — every concept verified on Wikipedia.",
      chips: ["No sign-up", "PNG & PDF", "Works on phones"].map((label, i) => ({ label, color: [PURPLE, TEAL, "#85b7eb"][i] })),
    },
    "knowledge-graph-generator": {
      eyebrow: "Knowledge graph generator",
      title: "See how a whole subject connects.",
      text: "Nodes for concepts, labelled links for how they relate — verified on Wikipedia, exportable as JSON.",
      chips: ["Labelled links", "3 layouts", "JSON export"].map((label, i) => ({ label, color: [PURPLE, TEAL, "#ef9f27"][i] })),
    },
    "upsc-mind-maps": {
      eyebrow: "UPSC CSE · General studies",
      title: "UPSC mind maps, topic-wise.",
      text: "Free interactive maps for the GS syllabus, with flashcards, quizzes and daily revision.",
      chips: ["History", "Polity", "Geography", "Economy", "Environment"].map((label, i) => ({ label, color: PALETTE[i] })),
    },
    "guide-kg-vs-mind-map": {
      eyebrow: "Guide",
      title: "Knowledge graph vs mind map vs concept map",
      text: "The differences, a side-by-side comparison, and which one to use for studying.",
    },
    about: { eyebrow: "About", title: "How Throvic works, and who made it.", text: "AI suggests the connections; Wikipedia verifies every concept." },
    contact: { eyebrow: "Contact", title: "Feedback, bugs and ideas.", text: "Every message is read by the developer." },
    privacy: { eyebrow: "Privacy policy", title: "Very little is collected.", text: "Your study progress stays on your own device." },
    terms: { eyebrow: "Terms of use", title: "A free service, used fairly.", text: "AI-assisted content to verify with its sources." },
  };
  for (const a of AUDIENCES) {
    out[a.slug] ??= { eyebrow: a.eyebrow, title: `${a.headline} ${a.headlineAccent}`, text: a.description };
  }
  for (const e of EXAMS) {
    out[`exam-${e.slug}`] = {
      eyebrow: e.level === "central" ? `Central exam · ${GROUPS[e.group].label}` : `State exam · ${e.state}`,
      title: `${e.short} preparation`,
      text: `${e.name} — syllabus topics as interactive knowledge maps.`,
      chips: e.subjects.slice(0, 6).map((s) => {
        const sub = subjectBySlug(s)!;
        return { label: sub.slug === "state-studies" && e.state ? `${e.state} studies` : sub.name.replace(/^Indian /, ""), color: sub.color };
      }),
    };
  }
  for (const s of SUBJECTS) {
    out[`subject-${s.slug}`] = {
      eyebrow: "Subject · knowledge maps",
      title: s.name,
      text: s.blurb,
      chips: s.topics.slice(0, 6).map((label) => ({ label, color: s.color })),
      accent: s.color,
    };
  }
  return out;
}

let registry: Record<string, ShareCard> | null = null;
export const shareCards = () => (registry ??= cards());

/** Metadata for a page plus its link-preview card: same title, description and address everywhere. */
export function withShare(meta: Metadata, card: string): Metadata {
  const title = typeof meta.title === "string" ? meta.title : ((meta.title as { absolute?: string } | undefined)?.absolute ?? SITE.title);
  const description = meta.description ?? SITE.description;
  const url = (meta.alternates?.canonical as string | undefined) ?? "/";
  const c = shareCards()[card];
  const images = [{ url: `/og/${card}.png`, width: OG_SIZE.width, height: OG_SIZE.height, alt: c ? `${c.eyebrow}: ${c.title}` : title, type: "image/png" }];
  return {
    ...meta,
    openGraph: { type: "website", siteName: SITE.name, locale: SITE.locale, url, title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

const NODES = [
  { x: 960, y: 300, r: 40, root: true },
  { x: 840, y: 165, r: 15 },
  { x: 1090, y: 175, r: 15 },
  { x: 1130, y: 350, r: 15 },
  { x: 1060, y: 480, r: 15 },
  { x: 860, y: 460, r: 15 },
  { x: 790, y: 310, r: 15 },
];
const PALETTE = [PURPLE, "#85b7eb", "#e9a3c9", TEAL, "#ef9f27", "#97c459"];

export async function renderShareCard(card: ShareCard) {
  const fonts = await brandFonts();
  const accent = card.accent ?? TEAL;
  const size = card.title.length > 30 ? 50 : card.title.length > 20 ? 58 : 64;
  // As many chips as fit on two rows (long topic names are shortened).
  let room = 96;
  const chips = (card.chips ?? [])
    .map((c) => ({ ...c, label: c.label.length > 26 ? `${c.label.slice(0, 24)}…` : c.label }))
    .filter((c) => (room -= c.label.length + 6) >= 0)
    .slice(0, 6);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: fonts.length ? "Manrope" : "sans-serif", ...OG_BACKGROUND }}>
        <svg width="1200" height="630" style={{ position: "absolute", left: 0, top: 0 }}>
          {NODES.slice(1).map((n, i) => (
            <line key={`l${i}`} x1={NODES[0].x} y1={NODES[0].y} x2={n.x} y2={n.y} stroke="rgba(175,169,236,0.35)" strokeWidth="2" />
          ))}
          {NODES.map((n, i) => (
            <circle key={`g${i}`} cx={n.x} cy={n.y} r={n.r * 2.2} fill={n.root ? accent : PALETTE[i % PALETTE.length]} fillOpacity="0.14" />
          ))}
          {NODES.map((n, i) =>
            n.root ? (
              <g key={i}>
                <circle cx={n.x} cy={n.y} r={n.r} fill="#13131c" stroke={accent} strokeWidth="6" />
                <circle cx={n.x} cy={n.y} r={n.r * 0.45} fill="#afa9ec" />
              </g>
            ) : (
              <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={PALETTE[(i - 1) % PALETTE.length]} stroke="#0d0d14" strokeWidth="4" />
            ),
          )}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", padding: "56px 64px", width: 760, height: "100%" }}>
          <OgBrand size={50} />
          <div style={{ display: "flex", marginTop: 50, flexShrink: 0, fontSize: 22, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: accent }}>{card.eyebrow}</div>
          <div style={{ display: "flex", marginTop: 14, flexShrink: 0, fontSize: size, fontWeight: 800, lineHeight: 1.06, letterSpacing: -2.4, color: "#ffffff" }}>{card.title}</div>
          <div style={{ display: "flex", marginTop: 18, flexShrink: 0, fontSize: 24, fontWeight: 500, lineHeight: 1.4, color: "rgba(232,230,240,0.72)" }}>{card.text.length > 110 ? `${card.text.slice(0, 107)}…` : card.text}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: "auto", paddingTop: 20, flexShrink: 0 }}>
            {chips.map((c) => (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 16px", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 20, fontWeight: 500, color: "#e8e6f0" }}>
                <div style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: c.color }} />
                {c.label}
              </div>
            ))}
            {!chips.length && <div style={{ display: "flex", fontSize: 22, color: "rgba(232,230,240,0.5)" }}>{new URL(SITE.url).host}</div>}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, ...(fonts.length ? { fonts } : {}) },
  );
}
