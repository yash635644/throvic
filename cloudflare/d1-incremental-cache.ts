import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { CacheEntryType, CacheValue, IncrementalCache, WithLastModified } from "@opennextjs/aws/types/overrides.js";

/**
 * Page cache (ISR) stored in Cloudflare D1, which is included in the Workers Free plan
 * (5 GB, 5M row reads and 100k row writes a day). OpenNext's built-in options need R2
 * (requires billing) or KV (only 1,000 writes a day on the free plan, too few for ISR).
 *
 * Uses the same D1 database as the tag cache (binding NEXT_TAG_CACHE_D1, see wrangler.jsonc).
 * Entries from older builds are deleted automatically.
 */
const BINDING = "NEXT_TAG_CACHE_D1";
const TABLE = "next_cache";
// D1 rows are limited to 2 MB; larger entries are simply not cached (the page still renders).
const MAX_BYTES = 1_900_000;

type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
};
type D1 = { prepare(query: string): D1Statement };

let tableReady: Promise<unknown> | null = null;
let prunedBuild: string | null = null;

const buildId = () => process.env.OPEN_NEXT_BUILD_ID || "no-build-id";
const cacheKey = (key: string, cacheType: CacheEntryType = "cache") => `${buildId()}/${cacheType}/${key}`;

async function database(): Promise<D1 | null> {
  const db = (getCloudflareContext().env as Record<string, unknown>)[BINDING] as D1 | undefined;
  if (!db) return null;
  tableReady ??= db
    .prepare(`CREATE TABLE IF NOT EXISTS ${TABLE} (key TEXT PRIMARY KEY, build_id TEXT NOT NULL, value TEXT NOT NULL, last_modified INTEGER NOT NULL)`)
    .run()
    .catch((e) => {
      tableReady = null;
      throw e;
    });
  await tableReady;
  return db;
}

class D1IncrementalCache implements IncrementalCache {
  readonly name = "throvic-d1-incremental-cache";

  async get<CacheType extends CacheEntryType = "cache">(key: string, cacheType?: CacheType): Promise<WithLastModified<CacheValue<CacheType>> | null> {
    try {
      const db = await database();
      if (!db) return null;
      const row = await db.prepare(`SELECT value, last_modified FROM ${TABLE} WHERE key = ?`).bind(cacheKey(key, cacheType)).first<{ value: string; last_modified: number }>();
      if (!row) return null;
      return { value: JSON.parse(row.value) as CacheValue<CacheType>, lastModified: row.last_modified };
    } catch (e) {
      console.error("[d1-cache] get failed:", (e as Error).message);
      return null;
    }
  }

  async set<CacheType extends CacheEntryType = "cache">(key: string, value: CacheValue<CacheType>, cacheType?: CacheType): Promise<void> {
    try {
      const db = await database();
      if (!db) return;
      const json = JSON.stringify(value);
      if (json.length > MAX_BYTES / 3 && new TextEncoder().encode(json).byteLength > MAX_BYTES) return;
      await db
        .prepare(
          `INSERT INTO ${TABLE} (key, build_id, value, last_modified) VALUES (?, ?, ?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, last_modified = excluded.last_modified`,
        )
        .bind(cacheKey(key, cacheType), buildId(), json, Date.now())
        .run();
      // Once per worker instance: drop entries left over from previous deploys.
      if (prunedBuild !== buildId()) {
        prunedBuild = buildId();
        await db.prepare(`DELETE FROM ${TABLE} WHERE build_id != ?`).bind(buildId()).run();
      }
    } catch (e) {
      console.error("[d1-cache] set failed:", (e as Error).message);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await database();
      if (!db) return;
      await db.prepare(`DELETE FROM ${TABLE} WHERE key = ?`).bind(cacheKey(key, "cache")).run();
    } catch (e) {
      console.error("[d1-cache] delete failed:", (e as Error).message);
    }
  }
}

const d1IncrementalCache = new D1IncrementalCache();
export default d1IncrementalCache;
