import type { MetadataRoute } from "next";
import { ALL_TOPICS } from "@/lib/catalog";
import { EXAMS } from "@/lib/exams";
import { absoluteUrl } from "@/lib/site";
import { SUBJECTS } from "@/lib/syllabus";

export const dynamic = "force-static";

/** When page content last changed. Search engines trust lastmod only if it moves when content does, so bump this on real updates. */
const UPDATED = new Date("2026-10-16");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = UPDATED;
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/explore"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...["students", "researchers", "creators", "curious"].map((p) => ({ url: absoluteUrl(`/${p}`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.85 })),
    ...["about", "contact", "privacy", "terms"].map((p) => ({ url: absoluteUrl(`/${p}`), lastModified: now, changeFrequency: "yearly" as const, priority: 0.4 })),
    ...["mind-map-generator", "knowledge-graph-generator", "upsc-mind-maps"].map((p) => ({ url: absoluteUrl(`/${p}`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: absoluteUrl("/guides/knowledge-graph-vs-mind-map"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/constitution"), lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: absoluteUrl("/exams"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/subjects"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...EXAMS.map((e) => ({ url: absoluteUrl(`/exams/${e.slug}`), lastModified: now, changeFrequency: "monthly" as const, priority: e.level === "central" ? 0.8 : 0.7 })),
    ...SUBJECTS.map((s) => ({ url: absoluteUrl(`/subjects/${s.slug}`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...ALL_TOPICS.map((t) => ({ url: absoluteUrl(`/topic/${t.slug}`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
