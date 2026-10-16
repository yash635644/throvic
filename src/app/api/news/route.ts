import { GATHERED_FEED, matchNews, parseFeed, plain, type NewsItem } from "@/lib/news";

export const dynamic = "force-dynamic";

// Gathered refreshes its feed every 10 minutes; so do we.
const TTL = 10 * 60_000;
let cached: { at: number; items: ReturnType<typeof parseFeed> } | null = null;

async function feed() {
  if (cached && Date.now() - cached.at < TTL) return cached.items;
  const res = await fetch(GATHERED_FEED, {
    headers: { accept: "application/rss+xml, application/xml" },
    signal: AbortSignal.timeout(6000),
    // Cloudflare keeps the feed at the edge for 10 minutes, so visitors never each cost Gathered a request.
    cf: { cacheTtl: 600, cacheEverything: true },
  } as RequestInit);
  if (!res.ok) throw new Error(`feed ${res.status}`);
  const items = parseFeed(await res.text());
  cached = { at: Date.now(), items };
  return items;
}

/** GET ?q=topic[&alt=other name] → { matched, items } — headlines that mention the topic, or the latest ones. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const topics = [url.searchParams.get("q"), url.searchParams.get("alt")].map((t) => (t ?? "").slice(0, 120).trim()).filter((t) => t.length > 1);
  let items: ReturnType<typeof parseFeed>;
  try {
    items = await feed();
  } catch {
    return Response.json({ matched: false, items: [] }, { status: 200, headers: { "cache-control": "no-store" } });
  }
  const hits = topics.length ? matchNews(items, topics) : [];
  const body: { matched: boolean; items: NewsItem[] } = hits.length
    ? { matched: true, items: hits }
    : { matched: false, items: items.slice(0, 4).map(plain) };
  return Response.json(body, { headers: { "cache-control": "public, max-age=300, s-maxage=600" } });
}
