import "server-only";
import type { WikiInfo } from "./types";

/** English Wikipedia lookups used to check and enrich every concept in a graph. */

// Wikimedia asks API clients to identify themselves with a way to contact them (else ~10 requests/min).
const UA = "Throvic/1.0 (https://throvic.pages.dev/contact; knowledge graph explorer)";
const HEADERS = { "Api-User-Agent": UA, "User-Agent": UA, Accept: "application/json" };

// Small per-instance memory cache: the same concepts come up again and again.
const memo = new Map<string, Promise<WikiInfo | null>>();
const MEMO_MAX = 800;

type Summary = {
  type?: string;
  title?: string;
  titles?: { normalized?: string };
  extract?: string;
  description?: string;
  thumbnail?: { source?: string; width?: number; height?: number };
  originalimage?: { source?: string; width?: number; height?: number };
  content_urls?: { desktop?: { page?: string } };
};

async function fetchSummary(title: string): Promise<WikiInfo | null> {
  const path = encodeURIComponent(title.trim().replace(/ /g, "_"));
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${path}?redirect=true`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Summary;
    if (!data.title || data.type === "disambiguation" || !data.extract) return null;
    return {
      title: data.titles?.normalized || data.title,
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${path}`,
      extract: data.extract,
      description: data.description,
      thumb: data.thumbnail?.source,
      ...panelImage(data),
    };
  } catch {
    return null;
  }
}

/**
 * A sharp image for the detail panel: the original when it is small enough, otherwise an 800px
 * rendition (Wikimedia thumbnail URLs accept any width up to the original). SVG/PNG files are
 * usually diagrams, logos, maps or flags, so they are flagged to be shown whole instead of cropped.
 */
function panelImage(data: Summary): Pick<WikiInfo, "image" | "imageW" | "imageH" | "imageKind"> {
  const orig = data.originalimage;
  const thumb = data.thumbnail;
  if (!orig?.source && !thumb?.source) return {};
  const w = orig?.width || thumb?.width || 0;
  const h = orig?.height || thumb?.height || 0;
  let image = orig?.source || thumb!.source!;
  if (w > 1000 && thumb?.source && /\/\d+px-/.test(thumb.source)) image = thumb.source.replace(/\/\d+px-/, "/800px-");
  const file = (orig?.source || thumb?.source || "").toLowerCase();
  const imageKind = /\.svg(\.png)?$|\.png$|\.gif$/.test(file) ? "graphic" : "photo";
  return { image, imageW: w || undefined, imageH: h || undefined, imageKind };
}

/** The Wikipedia article for a title (redirects followed), or null if none / disambiguation page. */
export function wikiSummary(title: string): Promise<WikiInfo | null> {
  const key = title.trim().toLowerCase();
  if (!key) return Promise.resolve(null);
  let hit = memo.get(key);
  if (!hit) {
    hit = fetchSummary(title);
    memo.set(key, hit);
    if (memo.size > MEMO_MAX) memo.delete(memo.keys().next().value as string);
  }
  return hit;
}

/** Best-matching article for free text the user typed ("black holes" → "Black hole"). */
export async function resolveTopic(query: string): Promise<WikiInfo | null> {
  const direct = await wikiSummary(query);
  if (direct) return direct;
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&srnamespace=0&format=json&formatversion=2`;
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { query?: { search?: { title: string }[] } };
    const title = data.query?.search?.[0]?.title;
    return title ? await wikiSummary(title) : null;
  } catch {
    return null;
  }
}

const SKIP_LINK = /^(\d{1,4}(s| BC| AD)?|List of .*|Index of .*|Outline of .*|.*\(disambiguation\)|ISBN.*|Doi.*|Wayback Machine|International Standard .*)$/i;

/**
 * Articles linked from the opening paragraphs of a page, in reading order: Wikipedia's own
 * "most related" concepts. Infoboxes, hatnotes and citation footnotes are left out.
 */
export async function wikiLeadLinks(title: string): Promise<string[]> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=text&section=0&redirects=1&disablelimitreport=1&disableeditsection=1&format=json&formatversion=2`;
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    const data = (await res.json()) as { parse?: { title?: string; text?: string } };
    const html = data.parse?.text || "";
    const self = (data.parse?.title || title).toLowerCase();
    const prose = (html.match(/<p\b[^>]*>[\s\S]*?<\/p>/g) || []).join(" ").replace(/<sup\b[\s\S]*?<\/sup>/g, "");
    const seen = new Set<string>([self]);
    const out: string[] = [];
    // Wikipedia has used "/wiki/Title", "./Title" and "https://en.wikipedia.org/wiki/Title" here; accept all three.
    for (const m of prose.matchAll(/<a\b[^>]*href="(?:https?:\/\/en\.wikipedia\.org)?(?:\/wiki\/|\.\/)([^"#?]+)[^"]*"[^>]*>/g)) {
      const t = decodeURIComponent(m[1]).replace(/_/g, " ");
      if (t.includes(":") || SKIP_LINK.test(t) || seen.has(t.toLowerCase())) continue;
      seen.add(t.toLowerCase());
      out.push(t);
    }
    return out;
  } catch {
    return [];
  }
}
