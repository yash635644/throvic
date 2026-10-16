import { ImageResponse } from "next/og";
import { topicBySlug } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/categories";
import { topicSnapshot } from "@/lib/graph-engine";
import { brandFonts, OG_BACKGROUND, OG_SIZE, OgBrand } from "@/lib/og";
import { subjectBySlug } from "@/lib/syllabus";

/** Per-topic preview image: subject, topic name, a mini map and its key concepts. */
export const alt = "Throvic knowledge map";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 604800;

export default async function TopicOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = topicBySlug(slug);
  const fonts = await brandFonts();
  const subject = topic ? subjectBySlug(topic.subject) : undefined;
  let title = topic?.title ?? "Knowledge map";
  let concepts: { title: string; color: string }[] = [];
  try {
    if (topic) {
      const snap = await topicSnapshot(topic.title);
      const root = snap.nodes[0];
      title = root?.wiki?.title ?? title;
      concepts = snap.nodes.slice(1, 9).map((n) => ({ title: n.wiki?.title ?? n.title, color: (CATEGORIES[n.category] ?? CATEGORIES.other).color }));
    }
  } catch {
    /* the card still works without concepts */
  }

  // Mini map: concepts on a ring around the topic.
  const cx = 930;
  const cy = 315;
  const ring = concepts.slice(0, 8).map((c, i, a) => {
    const angle = (i / a.length) * Math.PI * 2 - Math.PI / 2;
    return { ...c, x: cx + Math.cos(angle) * 190, y: cy + Math.sin(angle) * 190 };
  });

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: fonts.length ? "Manrope" : "sans-serif", ...OG_BACKGROUND }}>
        <svg width="1200" height="630" style={{ position: "absolute", left: 0, top: 0 }}>
          {ring.map((n, i) => (
            <line key={`l${i}`} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke={n.color} strokeOpacity="0.45" strokeWidth="2" />
          ))}
          {ring.map((n, i) => (
            <circle key={`g${i}`} cx={n.x} cy={n.y} r="34" fill={n.color} fillOpacity="0.16" />
          ))}
          {ring.map((n, i) => (
            <circle key={`n${i}`} cx={n.x} cy={n.y} r="15" fill={n.color} stroke="#0d0d14" strokeWidth="4" />
          ))}
          <circle cx={cx} cy={cy} r="88" fill="#7f77dd" fillOpacity="0.18" />
          <circle cx={cx} cy={cy} r="42" fill="#13131c" stroke="#5dcaa5" strokeWidth="6" />
          <circle cx={cx} cy={cy} r="18" fill="#afa9ec" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", padding: "56px 64px", width: 700, height: "100%" }}>
          <OgBrand size={44} />
          <div style={{ display: "flex", marginTop: 54, fontSize: 22, fontWeight: 800, letterSpacing: 2, color: subject?.color ?? "#afa9ec", textTransform: "uppercase" }}>
            {subject?.name ?? "Knowledge map"}
            {topic?.state ? ` · ${topic.state}` : ""}
          </div>
          <div style={{ display: "flex", marginTop: 14, fontSize: title.length > 28 ? 56 : 68, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2.5, color: "#ffffff" }}>{title}</div>
          {concepts.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
              {concepts.slice(0, 6).map((c) => (
                <div key={c.title} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 19, fontWeight: 500, color: "rgba(232,230,240,0.85)" }}>
                  <div style={{ width: 9, height: 9, borderRadius: 9, background: c.color }} />
                  {c.title.length > 26 ? `${c.title.slice(0, 25)}…` : c.title}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", marginTop: "auto", fontSize: 21, fontWeight: 500, color: "rgba(232,230,240,0.55)" }}>Interactive knowledge map · throvic.pages.dev</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, ...(fonts.length ? { fonts } : {}) },
  );
}
