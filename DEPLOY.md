# Deploying the new Throvic to throvic.pages.dev

The new site replaces the old one at the **same address** (https://throvic.pages.dev) and in the **same GitHub repo** (yash635644/throvic). It is the setup Gathered already uses:

```
visitor ─► Pages project "throvic"   (throvic.pages.dev: static pages, images, share cards — free, unlimited)
              └─ topic pages + /api ─► service binding SITE ─► Worker "throvic-site" (Next.js)
                                                                └─ D1 "throvic-db"  saved maps + page cache
```

Every push to `main` builds and deploys both parts through GitHub Actions (`.github/workflows/deploy.yml`). The Render backend is no longer used.

> **Why the Pages project must be recreated:** the current `throvic` project is connected to GitHub and builds the old frontend itself. A Git-connected Pages project can't receive deploys from GitHub Actions/wrangler, so it is deleted and recreated with the same name. The site is offline for those few minutes (Part C), usually under 10.

All commands run in **PowerShell, in the `throvic-next` folder**.

---

## Part A — Cloudflare preparation (old site stays live)

```powershell
npx wrangler login                      # opens the browser; log in to the account that has "throvic" and "gathered"
npx wrangler d1 create throvic-db       # prints a database_id
```

1. Paste the printed `database_id` into `wrangler.jsonc` (replace `00000000-0000-0000-0000-000000000000`).
2. Add the AI key to the Worker (this also creates the Worker):

   ```powershell
   npx wrangler secret put GROQ_API_KEY  # paste the same key as in .env.local
   ```

3. Deploy the Worker once. It is private (no public address), so the old site is unaffected:

   ```powershell
   npx opennextjs-cloudflare build
   npx opennextjs-cloudflare deploy
   ```

## Part B — GitHub preparation

1. **Keep the old version safe.** On GitHub: repo → *Releases* → *Draft a new release* → tag `v1-old` on `main` → Publish. (The old code stays downloadable forever.)
2. **Secrets** — repo → Settings → Secrets and variables → Actions → *New repository secret*:
   - `CLOUDFLARE_ACCOUNT_ID` — Cloudflare dashboard → Workers & Pages → right sidebar *Account ID*.
   - `CLOUDFLARE_API_TOKEN` — Cloudflare → My Profile → API Tokens → Create Token → template **Edit Cloudflare Workers**, then *Add more* → **Account · Cloudflare Pages · Edit** and **Account · D1 · Edit** → Create.
3. (Optional) *Variables* tab: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION`.

## Part C — Switch over (the short offline window)

1. Cloudflare → Workers & Pages → **throvic** → Settings: note any environment variables (only the old `NEXT_PUBLIC_API_URL`, which is no longer needed), then **Delete project**.
2. Immediately recreate it under the same name, so nobody else can take `throvic.pages.dev`:

   ```powershell
   npx wrangler pages project create throvic --production-branch main
   ```

3. Workers & Pages → **throvic** → Settings → Bindings → *Add* → **Service binding**: name `SITE`, service `throvic-site` → Save.
4. Put the new code in the repo (see *Pushing the code* below). The push starts the GitHub Action, which deploys the site; it takes about 5 minutes (repo → *Actions* tab to watch).

   *Or*, to go live without waiting for GitHub: `npm run cf:deploy` from this folder.

5. Open https://throvic.pages.dev — done.

### Pushing the code

The new app becomes the repo root (the old `frontend/` and `backend/` folders are kept in the `v1-old` release):

```powershell
cd C:\new
git clone https://github.com/yash635644/throvic.git throvic-repo
cd throvic-repo
git rm -r -q .                                   # remove the old files from the working tree
robocopy C:\new\throvic-main\throvic-next . /E /XD node_modules .next .open-next .wrangler dist /XF .env.local .dev.vars tsconfig.tsbuildinfo
git add -A
git status                                       # check: no .env.local, no .dev.vars, no node_modules
git commit -m "Rebuild Throvic on Next.js 16 + Cloudflare Workers"
git push origin main
```

## Part D — After it's live

- **Render:** suspend or delete the `throvic-backend` service (no longer used).
- **Google Search Console:** add/verify `https://throvic.pages.dev`, then Sitemaps → submit `sitemap.xml`.
- **Bing Webmaster Tools:** import the site from Search Console (one click). The deploy already pings Bing via IndexNow.
- **Check:** home, `/explore?q=Black hole`, a topic page (e.g. `/topic/photosynthesis` — the first visit builds it, about 20–30 s, then it's instant), and a share preview by pasting a link into WhatsApp.
- **Formspree:** if your form restricts domains, `throvic.pages.dev` is unchanged.

## If something goes wrong

- **Site shows "Loading Throvic…" or `/api` returns 503:** the `SITE` service binding is missing (Part C step 3) — add it and redeploy (Actions → *Deploy website* → *Run workflow*).
- **Action fails at "Deploy the public Pages front":** the Pages project is still the old Git-connected one (Part C steps 1–2), or the API token lacks *Cloudflare Pages: Edit*.
- **Maps are Wikipedia-only (no relationship labels):** `GROQ_API_KEY` isn't set on the Worker (Part A step 2).
- **Roll back:** the old code is in the `v1-old` release; the previous Worker version can be restored from Workers & Pages → throvic-site → Deployments.
