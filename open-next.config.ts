import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";
import d1IncrementalCache from "./cloudflare/d1-incremental-cache";

/**
 * Cloudflare Workers build. Everything runs on the Workers Free plan, same setup as Gathered:
 * cached pages live in D1 (no R2/billing), and the same D1 database holds the graph cache
 * (src/lib/cache.ts).
 */
export default defineCloudflareConfig({
  incrementalCache: d1IncrementalCache,
  tagCache: d1NextTagCache,
  queue: memoryQueue,
  enableCacheInterception: true,
});
