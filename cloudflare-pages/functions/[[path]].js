// Cloudflare Pages front for Throvic (same setup as Gathered).
//
// Static-first: every page is pre-built at deploy and served as a plain file by Pages: instant, free
// and unlimited. Only the graph API (/api/*) and anything not pre-built go to the Next.js Worker over
// a private service binding named SITE (set once in the Pages dashboard; see README.md).
//
// Retries: on the free plan a request can occasionally go over the per-request CPU limit (Cloudflare
// error 1101/1102). Page loads are retried; graph API calls (POST) get the response as it is.

const WORKER_ERROR = /error code: 11\d\d/;
const RETRIES = 3;

async function attempt(request, env) {
  try {
    const res = await env.SITE.fetch(request.clone());
    if (res.status < 500) return { res };
    if (request.method !== "GET" && request.method !== "HEAD") return { res };
    const text = await res.clone().text();
    return { error: WORKER_ERROR.test(text) ? text.trim().slice(0, 60) : `HTTP ${res.status}` };
  } catch (e) {
    return { error: String(e && e.message ? e.message : e).slice(0, 120) };
  }
}

async function fromWorker(request, env) {
  const retryable = request.method === "GET" || request.method === "HEAD";
  let last = "";
  for (let i = 0; i <= (retryable ? RETRIES : 0); i++) {
    const { res, error } = await attempt(request, env);
    if (res) {
      if (i === 0) return res;
      const out = new Response(res.body, res);
      out.headers.set("x-worker-retries", String(i));
      out.headers.set("x-worker-last-error", last);
      return out;
    }
    last = error;
    if (i < RETRIES) await new Promise((r) => setTimeout(r, 150 * (i + 1)));
  }
  return null;
}

/** Pre-built page saved by scripts/prepare-pages.mjs (e.g. /explore → explore.html). */
async function staticPage(request, url, env) {
  if (!env.ASSETS || (request.method !== "GET" && request.method !== "HEAD")) return null;
  if (url.pathname.startsWith("/api/")) return null;
  if (request.headers.has("rsc") || request.headers.has("next-router-state-tree") || url.searchParams.has("_rsc")) return null;
  const accept = request.headers.get("accept") || "";
  if (accept && !accept.includes("text/html") && !accept.includes("*/*")) return null;
  const assetPath = url.pathname.replace(/\/+$/, "") || "/";
  try {
    const res = await env.ASSETS.fetch(new Request(new URL(assetPath, url.origin), { method: "GET" }));
    if (res.status !== 200 || !(res.headers.get("content-type") || "").includes("text/html")) return null;
    const headers = new Headers(res.headers);
    headers.set("cache-control", "public, max-age=0, must-revalidate");
    headers.set("x-served-from", "static");
    headers.set("x-frame-options", "SAMEORIGIN");
    headers.set("content-security-policy", "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self' https://formspree.io; upgrade-insecure-requests");
    return new Response(request.method === "HEAD" ? null : res.body, { status: 200, headers });
  } catch {
    return null;
  }
}

function busyPage(lastError) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="3"><title>Loading… | Throvic</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#07070d;color:#ecebf7}p{color:#a3a1bd}</style></head><body><main style="text-align:center;padding:24px"><h1>Loading Throvic…</h1><p>This page will open in a moment.</p></main></body></html>`,
    { status: 503, headers: { "content-type": "text/html; charset=utf-8", "retry-after": "3", "cache-control": "no-store", "x-worker-last-error": lastError || "" } },
  );
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const fromPages = await staticPage(request, url, env);
  if (fromPages) return fromPages;
  const res = await fromWorker(request, env);
  if (res) return res;
  if (url.pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ error: "The map service is busy. Please try again in a moment." }), {
      status: 503,
      headers: { "content-type": "application/json", "retry-after": "3", "cache-control": "no-store" },
    });
  }
  return busyPage("worker-failed");
}
