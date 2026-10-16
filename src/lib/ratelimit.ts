import "server-only";

/**
 * Simple per-visitor limit on graph requests, so nobody can drain the AI quota.
 * Counts are per Worker instance; good enough to stop scripts hammering the API.
 */
const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 40;
const hits = new Map<string, number[]>();

export function clientIp(req: Request) {
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

/** Returns seconds to wait, or 0 when the request is allowed. */
export function rateLimit(ip: string): number {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.delete(hits.keys().next().value as string);
  return 0;
}
