/* Throvic service worker: installable app, fast repeat visits, and an offline page.
   Static build files are cache-first (their names change on every deploy), pages are
   network-first with the last copy as a fallback, and /api is never cached. */

const VERSION = "throvic-v3";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;
const OFFLINE = "/offline";
const MAX_PAGES = 40;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES);
      await pages.addAll([OFFLINE, "/icon-192.png", "/icon.svg"]);
      // The offline page must also work with nothing else cached: save the scripts and styles it uses.
      const html = await (await pages.match(OFFLINE)).text();
      const assets = [...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]);
      await (await caches.open(STATIC)).addAll([...new Set(assets)]).catch(() => {});
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname === "/sw.js") return;

  // Build output and icons: cache-first.
  if (url.pathname.startsWith("/_next/static/") || /\.(png|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Pages: network-first, falling back to the last saved copy, then the offline page.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(req, copy).then(() => trim(PAGES, MAX_PAGES)));
          }
          return res;
        })
        .catch(async () => {
          const saved = await caches.match(req, { ignoreSearch: url.pathname !== "/explore" });
          if (saved) return saved;
          // Redirect (rather than serve the offline page at this URL) so the app hydrates at the right address.
          return (await caches.match(OFFLINE)) ? Response.redirect(OFFLINE, 302) : Response.error();
        }),
    );
  }
});
