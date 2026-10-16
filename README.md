# Throvic — interactive knowledge graph explorer

Type any topic and it unfolds into a graph of related concepts. Every concept is checked against Wikipedia; tap one to read, expand it to go deeper.

Rebuild of the old `throvic-main` (Next.js static export on Cloudflare Pages + Express backend on Render) as **one Next.js 16 app on Cloudflare's free plan**, using the same setup as Gathered. Render is no longer needed.

## Run locally

```bash
npm install
cp .env.example .env.local     # add GROQ_API_KEY (optional, see below)
cp .dev.vars.example .dev.vars # same key, for the Cloudflare preview
npm run dev                    # http://localhost:3000  (phone on the same Wi-Fi: http://<PC-IP>:3000)
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload. Uses a local D1 database, like production. |
| `npm run build` | Production Next.js build (checks types). |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript. |
| `npm run cf:preview` | Builds the real Cloudflare Worker and runs it locally (port 8787). |
| `npm run cf:deploy` | Builds and deploys the Worker and the Pages front (see Deploy). |

**Without `GROQ_API_KEY`** the app still works: graphs are built from the links in each Wikipedia article's opening paragraphs, with no relationship labels. With the key, AI picks the concepts and labels every link ("discovered by", "part of"…), and Wikipedia still verifies each concept.

## How it works

```
Browser ──POST /api/graph/explore {topic}──▶ Worker
                                             1. resolve topic on Wikipedia ("black holes" → "Black hole")
                                             2. D1 cache hit? → replay instantly
                                             3. Groq streams JSON Lines (node / link)
                                             4. each node → Wikipedia summary (photo, extract, link, verified)
                                             5. duplicates merged ("Einstein" = "Albert Einstein")
◀── NDJSON stream: meta, node, link, enrich, merge, done
```

- `/api/graph/expand` does the same for one concept, with the path from the root and the existing concepts as context, so it adds new ideas and cross-links back into the map.
- Graphs are cached in D1 for 30 days. AI-built and Wikipedia-only graphs are cached separately, so adding the key upgrades popular topics. Bump `CACHE_VERSION` in `src/lib/graph-engine.ts` to clear the cache after prompt changes.
- Rate limit: 40 graph requests per visitor per 5 minutes (`src/lib/ratelimit.ts`).
- The graph is drawn on a `<canvas>` (`src/components/graph/`): d3-force physics, d3-zoom (pinch, wheel, drag), Wikipedia photos inside nodes, labels drawn at screen size. Physics only runs while something is moving.

## Project layout

```
src/
  app/
    page.tsx                landing page (static)
    explore/page.tsx        the explorer (static shell)
    api/graph/explore|expand  streaming graph API (the only server code)
    robots.ts sitemap.ts manifest.ts llms.txt/ icon.svg not-found.tsx
  components/
    graph/                  store.ts (graph state), engine.ts (physics + camera), render.ts (canvas), GraphCanvas.tsx
    explore/                ExploreApp (controller), SearchBar, DetailPanel (side panel / mobile sheet), Overlays
    landing/                Hero (+ live HeroGraph demo), header, footer, feedback form
  lib/
    graph-engine.ts         prompts, streaming parser, dedupe/merge, Wikipedia fallback, caching
    groq.ts wiki.ts cache.ts ratelimit.ts
    seo.tsx                 JSON-LD (WebSite + SearchAction, WebApplication, founder Person, FAQPage)
    site.ts categories.ts topics.ts faq.ts
cloudflare/                 D1 page cache (from Gathered)
cloudflare-pages/functions  Pages front: serves pre-built pages, forwards /api to the Worker
scripts/prepare-pages.mjs   builds cloudflare-pages/dist after the Worker build
```

## SEO / AEO / GEO

- Per-page metadata, canonical URLs, Open Graph/Twitter cards (`public/og-image.png`).
- JSON-LD: `WebSite` with `SearchAction` (`/explore?q=`), `WebApplication` (free), `Person` (same `@id` as the portfolio and Gathered), `FAQPage` on the home page.
- `/llms.txt` for AI assistants, `/robots.txt` (all crawlers allowed, `/api/` disallowed), `/sitemap.xml`, web manifest.
- Optional env: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION`, `NEXT_PUBLIC_GA_ID`.

## Deploy

Pushes to `main` deploy automatically with GitHub Actions (`.github/workflows/deploy.yml`). The first-time setup (Cloudflare Worker, D1, secrets, and replacing the old Git-connected Pages project) is in **[DEPLOY.md](DEPLOY.md)**.

The public address stays **https://throvic.pages.dev**.
