import { exploreGraph } from "@/lib/graph-engine";
import { cleanTopic } from "@/lib/keys";
import { foreignOrigin, jsonError, MAX_BODY, streamEvents } from "@/lib/stream";
import { LEVELS, type Level } from "@/lib/types";

export const dynamic = "force-dynamic";

/** POST { topic, level? } → NDJSON stream of graph events for a new map. */
export async function POST(req: Request) {
  if (foreignOrigin(req)) return jsonError(403, "Requests from other sites are not allowed.");
  if (Number(req.headers.get("content-length") || 0) > MAX_BODY) return jsonError(413, "Request too large.");
  const body = (await req.json().catch(() => null)) as { topic?: unknown; level?: unknown } | null;
  const topic = cleanTopic(body?.topic);
  if (topic.length < 2) return jsonError(400, "Please enter a topic.");
  const level: Level = LEVELS.includes(body?.level as Level) ? (body!.level as Level) : "standard";
  return streamEvents(req, (emit) => exploreGraph({ topic, level }, emit));
}
