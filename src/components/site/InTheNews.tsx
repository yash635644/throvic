"use client";

import { ArrowUpRight, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/news";

const ago = (date: string) => {
  const h = Math.round((Date.now() - new Date(date).getTime()) / 3_600_000);
  if (!Number.isFinite(h)) return "";
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
};

/** Recent Gathered headlines that mention a topic, or the latest headlines when none do (labelled as such). */
export function InTheNews({ topic, alt, limit = 4 }: { topic: string; alt?: string; limit?: number }) {
  const [data, setData] = useState<{ matched: boolean; items: NewsItem[] } | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const qs = new URLSearchParams({ q: topic, ...(alt && alt !== topic ? { alt } : {}) });
    fetch(`/api/news?${qs}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d))
      .catch(() => {});
    return () => ctrl.abort();
  }, [topic, alt]);

  if (data && !data.items.length) return null;

  return (
    <section aria-labelledby="in-the-news">
      <h2 id="in-the-news" className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] text-amber">
        <Newspaper className="h-4 w-4" /> {data && !data.matched ? "Latest on Gathered" : "In the news"}
      </h2>
      <p className="mt-2 text-[13.5px] text-muted">
        {data && !data.matched ? `No recent headlines mention ${topic} — here's what's new today.` : `Recent headlines that mention ${topic}.`}
      </p>
      <ul className="mt-3 divide-y divide-white/[0.06] border-y border-white/[0.06]">
        {data
          ? data.items.slice(0, limit).map((n) => (
              <li key={n.link}>
                <a href={n.link} target="_blank" rel="noopener" className="group flex items-start justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-[14.5px] font-semibold leading-snug text-fg/90 group-hover:text-white">{n.title}</span>
                    <span className="mt-1 block text-[12px] text-faint">
                      {n.category}
                      {n.category && " · "}
                      {ago(n.date)}
                    </span>
                  </span>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
                </a>
              </li>
            ))
          : [0, 1, 2].map((i) => (
              <li key={i} className="py-3" aria-hidden>
                <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
                <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-white/[0.04]" />
              </li>
            ))}
      </ul>
    </section>
  );
}
