import "server-only";

/**
 * Minimal Groq client (OpenAI-compatible Chat Completions API), streaming.
 * Server-only: the key is never shipped to the browser. Same models as Gathered.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const PRIMARY_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || "openai/gpt-oss-20b";

export const hasGroq = () => Boolean(process.env.GROQ_API_KEY);

export type Message = { role: "system" | "user" | "assistant"; content: string };

async function open(model: string, messages: Message[], maxTokens: number) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_completion_tokens: maxTokens,
      stream: true,
      ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
    }),
    signal: AbortSignal.timeout(45000),
    // No cache option: `no-store` would make Next.js refuse to build topic pages (static → dynamic error).
    // POST requests are never cached anyway.
  });
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw Object.assign(new Error(`Groq ${model} ${res.status}: ${detail.slice(0, 300)}`), { status: res.status });
  }
  return res.body;
}

/**
 * Streams the reply text. Falls back to the smaller model when the main one is rate-limited,
 * missing or failing (only before any text has arrived, so nothing is duplicated).
 */
export async function* groqStream(messages: Message[], { maxTokens = 2400 } = {}): AsyncGenerator<string> {
  if (!hasGroq()) throw new Error("GROQ_API_KEY is not set");
  let body: ReadableStream<Uint8Array>;
  try {
    body = await open(PRIMARY_MODEL, messages, maxTokens);
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    if (!FALLBACK_MODEL || FALLBACK_MODEL === PRIMARY_MODEL || ![400, 404, 429].includes(status) && status < 500) throw err;
    console.warn(`[groq] ${PRIMARY_MODEL} failed (${status}), using ${FALLBACK_MODEL}`);
    body = await open(FALLBACK_MODEL, messages, maxTokens);
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
        const text = json.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        /* keep-alive or partial line */
      }
    }
  }
}
