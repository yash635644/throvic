import "server-only";
import { clientIp, rateLimit } from "./ratelimit";
import type { StreamEvent } from "./types";

const HEADERS = {
  "Content-Type": "application/x-ndjson; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex",
};

export function jsonError(status: number, message: string, extra: Record<string, string> = {}) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store", ...extra } });
}

/** Rate-limits the caller, then streams the events `run` emits as NDJSON (one JSON object per line). */
/**
 * Requests from other websites are refused, so no one can put Throvic's map service (and its free AI
 * quota) behind their own site. Same-site requests and tools without an Origin header pass.
 */
export function foreignOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(req.url).host;
  } catch {
    return true;
  }
}

/** Bodies larger than this are refused before they are read (a full map's request is a few KB). */
export const MAX_BODY = 64 * 1024;

export function streamEvents(req: Request, run: (emit: (e: StreamEvent) => void) => Promise<void>) {
  if (foreignOrigin(req)) return jsonError(403, "Requests from other sites are not allowed.");
  if (Number(req.headers.get("content-length") || 0) > MAX_BODY) return jsonError(413, "Request too large.");
  const wait = rateLimit(clientIp(req));
  if (wait) return jsonError(429, `Too many maps in a short time. Try again in ${wait} seconds.`, { "Retry-After": String(wait) });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let open = true;
      const emit = (e: StreamEvent) => {
        if (!open) return;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(e)}\n`));
        } catch {
          open = false; // visitor left
        }
      };
      try {
        await run(emit);
      } catch (e) {
        console.error("[graph] failed:", (e as Error).message);
        emit({ type: "error", message: "Something went wrong while mapping this topic. Please try again." });
      }
      if (open) controller.close();
    },
  });
  return new Response(stream, { headers: HEADERS });
}
