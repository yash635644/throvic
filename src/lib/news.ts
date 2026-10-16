import { SITE } from "./site";

/** Headlines from Gathered's public RSS feed, matched to a topic for "In the news". */

export const GATHERED_FEED = new URL("feed.xml", SITE.gathered.url).href;

export interface NewsItem {
  title: string;
  link: string;
  date: string;
  category: string;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'" };
const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (m, e: string) =>
      e[0] === "#" ? String.fromCodePoint(e[1] === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENTITIES[e] ?? m),
    )
    .trim();

const tag = (xml: string, name: string) => decode(xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1] ?? "");

export function parseFeed(xml: string): (NewsItem & { text: string })[] {
  const origin = new URL(SITE.gathered.url).origin;
  return (
    [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .map(([, item]) => {
        const title = tag(item, "title");
        return { title, link: tag(item, "link"), date: tag(item, "pubDate"), category: tag(item, "category"), text: `${title} ${tag(item, "description")}` };
      })
      // Only real Gathered story links: a tampered feed can never point to another site or a javascript: URL.
      .filter((i) => i.title && i.link.startsWith(`${origin}/`))
  );
}

export const plain = ({ title, link, date, category }: NewsItem): NewsItem => ({ title, link, date, category });

const STOP = new Set(["the", "and", "of", "in", "on", "for", "to", "a", "an", "india", "indian", "history", "system", "act"]);

/** Common short forms used in headlines. */
const ALIASES: Record<string, string[]> = {
  "reserve bank of india": ["RBI"],
  "indian space research organisation": ["ISRO"],
  "goods and services tax": ["GST"],
  "supreme court of india": ["Supreme Court", "SC"],
  "election commission of india": ["Election Commission", "ECI"],
  "artificial intelligence": ["AI"],
  "gross domestic product": ["GDP"],
  "united nations": ["UN"],
  "world trade organization": ["WTO"],
  "international monetary fund": ["IMF"],
  "climate change": ["climate"],
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Patterns that count as a mention of the topic in a headline. */
function patterns(topic: string): RegExp[] {
  const name = topic.replace(/\s*\(.*?\)\s*/g, " ").trim();
  const out = [new RegExp(`\\b${escape(name)}\\b`, "i")];
  for (const a of ALIASES[name.toLowerCase()] ?? []) out.push(new RegExp(`\\b${escape(a)}\\b`, a.length <= 4 ? "" : "i"));
  // Multi-word topics also match when every significant word appears ("Monetary policy" ↔ "policy … monetary").
  const words = name.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !STOP.has(w));
  if (words.length >= 2) out.push(new RegExp(words.map((w) => `(?=[\\s\\S]*\\b${escape(w)})`).join(""), "i"));
  return out;
}

export function matchNews(items: (NewsItem & { text: string })[], topics: string[], limit = 5): NewsItem[] {
  const res = topics.filter(Boolean).flatMap(patterns);
  return items
    .filter((i) => res.some((r) => r.test(i.text)))
    .slice(0, limit)
    .map(plain);
}
