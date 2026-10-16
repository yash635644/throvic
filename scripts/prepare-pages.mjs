// Builds cloudflare-pages/dist from the OpenNext output (run after `opennextjs-cloudflare build`).
//
// Static files (JS/CSS chunks, icons, images) are served by Cloudflare Pages itself: free and
// unlimited, and they don't use up the Workers free plan's 100k requests/day. Everything else
// (pages, API routes, sitemaps) goes through functions/[[path]].js to the Next.js Worker.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const src = ".open-next/assets";
const out = "cloudflare-pages/dist";

if (!existsSync(src)) {
  console.error(`${src} not found. Run "npx opennextjs-cloudflare build" first.`);
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
cpSync(src, out, { recursive: true, filter: (p) => !p.endsWith("BUILD_ID") });

// Pre-built text files (manifest, robots.txt, sitemap.xml, llms.txt, icon.svg) become plain static
// files too. The browser asks for the manifest on every page load, so this alone saves one Worker
// request per visit. (OG images have no file extension, so they stay on the Worker.)
const STATIC_ROUTES = ["manifest.webmanifest", "robots.txt", "sitemap.xml", "llms.txt", "icon.svg"];
const routeCache = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { recursive: true })
        .map(String)
        .filter((p) => /APP_ROUTE/.test(p) && p.endsWith(".cache"))
        .map((p) => join(dir, p))
    : [];
for (const file of routeCache(".open-next/cache")) {
  const name = file.split(/[\\/]\$[\\/]/)[1]?.replace(/\.cache$/, "").replace(/\\/g, "/");
  // Link-preview cards (/og/<card>.png) are pre-built PNGs too: instant for WhatsApp & co., and free.
  const card = /^og\/[\w-]+\.png$/.test(name ?? "");
  if (!STATIC_ROUTES.includes(name) && !card) continue;
  try {
    const entry = JSON.parse(readFileSync(file, "utf8"));
    if (entry?.meta?.status !== 200 || typeof entry.body !== "string") continue;
    mkdirSync(dirname(join(out, name)), { recursive: true });
    writeFileSync(join(out, name), card ? Buffer.from(entry.body, "base64") : entry.body);
  } catch {
    /* leave it to the Worker */
  }
}

// Pages allows 100 include/exclude rules in total.
const exclude = readdirSync(out)
  .filter((name) => !name.startsWith("_") || name === "_next")
  .map((name) => (statSync(join(out, name)).isDirectory() ? `/${name}/*` : `/${name}`));

// Headers for the static files Pages serves (the Worker sets headers for everything else).
writeFileSync(
  join(out, "_headers"),
  `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Frame-Options: SAMEORIGIN
  Content-Security-Policy: frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self' https://formspree.io; upgrade-insecure-requests
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()
  Cross-Origin-Opener-Policy: same-origin-allow-popups

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/og/*
  Cache-Control: public, max-age=86400

/sw.js
  Cache-Control: no-cache
  Service-Worker-Allowed: /
`,
);

// Every page pre-built during this deploy (home, explore, exams, subjects, audience and legal pages),
// saved at its normal address as plain HTML. Their content only changes when we deploy, so they are
// added to the exclude list below: Pages serves them directly, free and unlimited, without running the
// function or the Worker. (A client-side navigation to one of them gets HTML instead of RSC data and
// Next.js simply does a normal page load.) Topic pages are made on demand, so they stay on the Worker.
const cacheRoot = ".open-next/cache";
let backups = 0;
const pagePaths = new Set();
if (existsSync(cacheRoot)) {
  const walk = (dir) =>
    readdirSync(dir).flatMap((name) => {
      const p = join(dir, name);
      return statSync(p).isDirectory() ? walk(p) : [p];
    });
  for (const file of walk(cacheRoot).filter((p) => /[\\/]APP_PAGE[\\/]/.test(p) && p.endsWith(".cache"))) {
    const route = file.split(/[\\/]\$[\\/]/)[1]?.replace(/\.cache$/, "").replace(/\\/g, "/");
    if (!route || (route.startsWith("_") && route !== "_not-found")) continue;
    let entry;
    try {
      entry = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      continue;
    }
    // The not-found page becomes 404.html: Pages then answers unknown paths with a real 404 instead of
    // treating the site as a single-page app and serving the home page.
    if (route === "_not-found") {
      if (typeof entry?.html === "string") writeFileSync(join(out, "404.html"), entry.html);
      continue;
    }
    if (entry?.type !== "app" || typeof entry.html !== "string" || entry.html.length < 1000) continue;
    const target = route === "index" ? join(out, "index.html") : join(out, `${route}.html`);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, entry.html);
    backups++;
    const [top, ...rest] = route.split("/");
    pagePaths.add(route === "index" ? "/" : rest.length ? `/${top}/*` : `/${top}`);
  }
}

// Pages allows 100 include/exclude rules in total.
const routes = [...new Set([...exclude, ...pagePaths])];
if (routes.length > 99) throw new Error(`Too many static paths (${routes.length}) for _routes.json`);
writeFileSync(join(out, "_routes.json"), JSON.stringify({ version: 1, include: ["/*"], exclude: routes }, null, 2));

console.log(`Pages front ready in ${out} (${routes.length} paths served as static files, ${backups} pre-built pages):`, routes.join(" "));
