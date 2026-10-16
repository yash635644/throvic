"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "@/components/ui/Link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ALL_TOPICS } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { today } from "@/lib/study";
import { subjectBySlug } from "@/lib/syllabus";

/** The day's topic: the same for everyone on a given date, cycling through the syllabus (state topics excluded). */
const POOL = ALL_TOPICS.filter((t) => t.subject !== "state-studies");
function topicFor(date: string) {
  const day = Math.floor(new Date(`${date}T12:00:00Z`).getTime() / 86_400_000);
  return POOL[(day * 37) % POOL.length];
}

const noop = () => () => {};
type Summary = { extract: string; thumb?: string; title: string };

export function ConceptOfDay({ className }: { className?: string }) {
  // The date is only known in the browser (pages are pre-built), so render after mount.
  const date = useSyncExternalStore(noop, today, () => null);
  const topic = useMemo(() => (date ? topicFor(date) : null), [date]);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    if (!topic) return;
    const ctrl = new AbortController();
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic.title.replace(/ /g, "_"))}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setSummary({ extract: d.extract, thumb: d.thumbnail?.source, title: d.titles?.normalized ?? d.title }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [topic]);

  const subject = topic ? subjectBySlug(topic.subject) : null;
  const pretty = date ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) : "";

  return (
    <section aria-label="Concept of the day" className={cn("relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-purple/[0.12] via-white/[0.02] to-teal/[0.08]", className)}>
      <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.14em] text-purple-light">
            <Sparkles className="h-4 w-4" /> Concept of the day
            {pretty && <span className="font-semibold normal-case tracking-normal text-faint">· {pretty}</span>}
          </p>
          {topic ? (
            <>
              <h2 className="mt-2 text-[28px] font-extrabold leading-[1.1] tracking-[-0.035em] text-white sm:text-[34px]">{summary?.title ?? topic.title}</h2>
              {subject && (
                <p className="mt-1 text-[13.5px] font-semibold" style={{ color: subject.color }}>
                  {subject.name}
                </p>
              )}
              <p className="mt-3 line-clamp-3 max-w-2xl text-[15.5px] leading-relaxed text-muted">{summary?.extract ?? " "}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/topic/${topic.slug}`} className="bg-brand inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14.5px] font-bold text-white shadow-glow transition hover:brightness-110">
                  Open the map <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={`/topic/${topic.slug}#revise`} className="inline-flex h-11 items-center rounded-full border border-white/10 bg-white/[0.04] px-5 text-[14.5px] font-semibold text-white transition hover:bg-white/[0.08]">
                  Take the 5-question quiz
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-3 space-y-2" aria-hidden>
              <div className="h-8 w-2/3 animate-pulse rounded-lg bg-white/[0.06]" />
              <div className="h-4 w-full animate-pulse rounded bg-white/[0.04]" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-white/[0.04]" />
            </div>
          )}
        </div>
        {summary?.thumb && (
          <img src={summary.thumb} alt="" crossOrigin="anonymous" loading="lazy" decoding="async" width={144} height={144} className="hidden h-36 w-36 rounded-2xl object-cover ring-1 ring-white/10 sm:block" />
        )}
      </div>
    </section>
  );
}
