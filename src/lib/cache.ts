import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { GraphSnapshot } from "./types";

/**
 * Finished graphs, shared by every visitor: popular topics open instantly and cost no AI calls.
 * Stored in D1 (same database as the page cache, see wrangler.jsonc), with a small in-memory layer.
 * Falls back to memory only when D1 isn't available.
 */

const TABLE = "graph_cache";
// Maps of a topic hardly change, so they are kept for half a year: fewer AI calls on the free quota.
const TTL_MS = 180 * 24 * 60 * 60 * 1000;
const memory = new Map<string, { value: GraphSnapshot; at: number }>();

type D1Statement = { bind(...v: unknown[]): D1Statement; first<T>(): Promise<T | null>; run(): Promise<unknown> };
type D1 = { prepare(q: string): D1Statement };

let ready: Promise<unknown> | null = null;

async function db(): Promise<D1 | null> {
  try {
    const d1 = (getCloudflareContext().env as Record<string, unknown>).NEXT_TAG_CACHE_D1 as D1 | undefined;
    if (!d1) return null;
    ready ??= d1
      .prepare(`CREATE TABLE IF NOT EXISTS ${TABLE} (key TEXT PRIMARY KEY, value TEXT NOT NULL, created INTEGER NOT NULL)`)
      .run()
      .catch((e) => {
        ready = null;
        throw e;
      });
    await ready;
    return d1;
  } catch {
    return null;
  }
}

function remember(key: string, value: GraphSnapshot, at = Date.now()) {
  memory.delete(key);
  memory.set(key, { value, at });
  if (memory.size > 300) memory.delete(memory.keys().next().value as string);
}

export async function getGraph(key: string): Promise<GraphSnapshot | null> {
  const mem = memory.get(key);
  if (mem && Date.now() - mem.at < TTL_MS) return mem.value;
  const d1 = await db();
  if (!d1) return null;
  try {
    const row = await d1.prepare(`SELECT value, created FROM ${TABLE} WHERE key = ?`).bind(key).first<{ value: string; created: number }>();
    if (!row || Date.now() - row.created > TTL_MS) return null;
    const value = JSON.parse(row.value) as GraphSnapshot;
    remember(key, value, row.created);
    return value;
  } catch (e) {
    console.error("[graph-cache] get failed:", (e as Error).message);
    return null;
  }
}

export async function setGraph(key: string, value: GraphSnapshot): Promise<void> {
  remember(key, value);
  const d1 = await db();
  if (!d1) return;
  try {
    await d1
      .prepare(`INSERT INTO ${TABLE} (key, value, created) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, created = excluded.created`)
      .bind(key, JSON.stringify(value), Date.now())
      .run();
  } catch (e) {
    console.error("[graph-cache] set failed:", (e as Error).message);
  }
}
