import { expandGraph } from "@/lib/graph-engine";
import { cleanTopic, topicKey } from "@/lib/keys";
import { foreignOrigin, jsonError, MAX_BODY, streamEvents } from "@/lib/stream";
import { LEVELS, type Level } from "@/lib/types";

export const dynamic = "force-dynamic";

type Body = { root?: unknown; node?: { id?: unknown; title?: unknown }; path?: unknown; existing?: unknown; level?: unknown };

/** POST { root, node: {id, title}, path: string[], existing: {id, title}[], level? } → NDJSON stream of new nodes/links. */
export async function POST(req: Request) {
  if (foreignOrigin(req)) return jsonError(403, "Requests from other sites are not allowed.");
  if (Number(req.headers.get("content-length") || 0) > MAX_BODY) return jsonError(413, "Request too large.");
  const body = (await req.json().catch(() => null)) as Body | null;
  const root = cleanTopic(body?.root);
  const title = cleanTopic(body?.node?.title, 90);
  if (!root || !title) return jsonError(400, "Missing concept to expand.");
  const id = typeof body?.node?.id === "string" && body.node.id ? body.node.id.slice(0, 100) : topicKey(title);

  const path = (Array.isArray(body?.path) ? body.path : []).slice(-8).map((p) => cleanTopic(p, 90)).filter(Boolean);
  const existing = (Array.isArray(body?.existing) ? body.existing : [])
    .slice(0, 250)
    .map((n: { id?: unknown; title?: unknown }) => ({ id: String(n?.id || "").slice(0, 100), title: cleanTopic(n?.title, 90) }))
    .filter((n) => n.id && n.title);
  if (!existing.some((n) => n.id === id)) existing.push({ id, title });
  const level: Level = LEVELS.includes(body?.level as Level) ? (body!.level as Level) : "standard";

  return streamEvents(req, (emit) => expandGraph({ root, node: { id, title }, path: path.length ? path : [root, title], existing, level }, emit));
}
