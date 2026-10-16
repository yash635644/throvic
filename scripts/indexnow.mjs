// Tells Bing (and other IndexNow engines: Yandex, Seznam, Naver) that pages changed, right after a deploy.
// Bing's index also feeds ChatGPT search and Microsoft Copilot. Google doesn't use IndexNow: it reads the sitemap.
//   node scripts/indexnow.mjs            → submits every URL in the live sitemap
//   node scripts/indexnow.mjs /a /b      → submits just these paths
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://throvic.pages.dev").replace(/\/+$/, "");
const KEY = "0878a259e0b1127c3c85ed1ee715a68b"; // also served at /0878a259e0b1127c3c85ed1ee715a68b.txt (public/), which proves we own the site

const paths = process.argv.slice(2);
let urls = paths.map((p) => SITE + (p.startsWith("/") ? p : "/" + p));
if (!urls.length) {
  const xml = await (await fetch(SITE + "/sitemap.xml")).text();
  urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
}
const host = new URL(SITE).host;
for (let i = 0; i < urls.length; i += 10000) {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: KEY, keyLocation: SITE + "/" + KEY + ".txt", urlList: urls.slice(i, i + 10000) }),
  });
  console.log(`IndexNow: ${Math.min(i + 10000, urls.length)}/${urls.length} URLs → ${res.status} ${res.statusText}`);
}
