"use client";

import { ArrowUpRight, Hand, Maximize, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "@/components/ui/Link";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Category } from "@/lib/categories";
import { CROSS_LINKS, GATHERED_CONSTITUTION, gatheredArticle, gatheredPart, gatheredSchedule, KEY_ARTICLES, PARTS, SCHEDULES } from "@/lib/constitution";
import { GraphCanvas, type GraphCanvasHandle } from "../graph/GraphCanvas";
import { GraphStore } from "../graph/store";

type Info = { kind: string; title: string; detail: string; color: string; gathered: string; topic?: string };

const KIND: Record<string, { label: string; category: Category; color: string }> = {
  root: { label: "Constitution", category: "other", color: "#afa9ec" },
  hub: { label: "Section", category: "other", color: "#afa9ec" },
  preamble: { label: "Preamble", category: "culture", color: "#f0997b" },
  part: { label: "Part", category: "science", color: "#7f77dd" },
  schedule: { label: "Schedule", category: "history", color: "#5dcaa5" },
  article: { label: "Article", category: "ideas", color: "#ef9f27" },
};

/** The Constitution of India as an interactive map: Parts → key Articles, plus the Schedules. */
export function ConstitutionMap({ topicHrefs }: { topicHrefs: Record<string, string> }) {
  const store = useMemo(() => new GraphStore(), []);
  useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
  const canvas = useRef<GraphCanvasHandle>(null);
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  // Everything on the map, described once: [id, label, kind, parent, details].
  const items = useMemo(() => {
    const list: [string, string, keyof typeof KIND, string | undefined, Info][] = [];
    list.push(["constitution", "Constitution of India", "root", undefined, { kind: "Constitution", title: "Constitution of India", detail: "Adopted on 26 November 1949; came into force on 26 January 1950.", color: KIND.root.color, gathered: GATHERED_CONSTITUTION.home, topic: topicHrefs["Constitution of India"] }]);
    list.push(["preamble", "Preamble", "preamble", "constitution", { kind: "Preamble", title: "The Preamble", detail: "Declares India a sovereign, socialist, secular, democratic republic and sets out justice, liberty, equality and fraternity.", color: KIND.preamble.color, gathered: GATHERED_CONSTITUTION.preamble, topic: topicHrefs["Preamble to the Constitution of India"] }]);
    list.push(["parts", "Parts", "hub", "constitution", { kind: "Section", title: "Parts of the Constitution", detail: "25 Parts group the articles by subject.", color: KIND.hub.color, gathered: GATHERED_CONSTITUTION.home }]);
    list.push(["schedules", "Schedules", "hub", "constitution", { kind: "Section", title: "Schedules", detail: "12 Schedules hold lists and details referred to in the articles.", color: KIND.hub.color, gathered: GATHERED_CONSTITUTION.home }]);
    for (const p of PARTS) list.push([`part-${p.id}`, `Part ${p.id}`, "part", "parts", { kind: `Part ${p.id}`, title: p.title, detail: `Articles ${p.articles}.${p.note ? ` ${p.note}` : ""}`, color: KIND.part.color, gathered: gatheredPart(p.id), topic: p.topic ? topicHrefs[p.topic] : undefined }]);
    for (const sc of SCHEDULES) list.push([`schedule-${sc.n}`, `${sc.name} Schedule`, "schedule", "schedules", { kind: "Schedule", title: `${sc.name} Schedule — ${sc.title}`, detail: sc.note ?? sc.title, color: KIND.schedule.color, gathered: gatheredSchedule(sc.name) }]);
    for (const ar of KEY_ARTICLES) list.push([`article-${ar.n}`, `Art. ${ar.n}`, "article", `part-${ar.part}`, { kind: `Article ${ar.n} · Part ${ar.part}`, title: ar.title, detail: `Article ${ar.n} of the Constitution of India, in Part ${ar.part}.`, color: KIND.article.color, gathered: gatheredArticle(ar.n), topic: ar.topic ? topicHrefs[ar.topic] : undefined }]);
    return list;
  }, [topicHrefs]);
  const info = useMemo(() => new Map(items.map(([id, , , , i]) => [id, i])), [items]);

  useEffect(() => {
    if (store.size) return;
    for (const [id, title, kind, parent, i] of items) {
      store.addNode({ id, title, category: KIND[kind].category, summary: i.detail, wiki: null }, parent);
      if (parent) store.addLink({ source: parent, target: id, label: "" });
    }
    for (const c of CROSS_LINKS) store.addLink({ source: `part-${c.part}`, target: `schedule-${c.schedule}`, label: c.label });
    const t = setTimeout(() => canvas.current?.fitWhenSettled(), 200);
    return () => clearTimeout(t);
  }, [store, items]);

  const selected = store.selected;
  const i = selected ? info.get(selected.id) : undefined;

  return (
    <div className="relative h-[520px] overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0b0b12]/70 sm:h-[620px]">
      <GraphCanvas
        key={fine ? "pointer" : "touch"}
        ref={canvas}
        store={store}
        interactive={fine}
        background={false}
        labels="all"
        layout="radial"
        maxFitScale={1.2}
        insets={{ top: 24, right: 24, bottom: 56, left: 24 }}
        ariaLabel="Map of the Constitution of India: Parts, Schedules and key Articles"
        onNodeClick={(id) => store.select(id)}
        onBackgroundClick={() => store.select(null)}
      />
      <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
        {(["part", "article", "schedule", "preamble"] as const).map((k) => (
          <span key={k} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0d0d14]/75 px-2.5 py-1 text-[12px] font-semibold text-muted backdrop-blur-md">
            <span className="h-2 w-2 rounded-full" style={{ background: KIND[k].color }} /> {k === "preamble" ? "Preamble" : `${KIND[k].label}s`}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/10 bg-[#0d0d14]/75 px-3 py-1.5 text-[12px] text-muted backdrop-blur-md">
        <Hand className="h-3.5 w-3.5" /> {fine ? "Drag, scroll to zoom, click any Part or Article" : "Tap any Part or Article"}
        {fine && (
          <button type="button" aria-label="Fit to screen" onClick={() => canvas.current?.fit()} className="pointer-events-auto -mr-1 ml-1 grid h-6 w-6 place-items-center rounded-full hover:bg-white/10 hover:text-white">
            <Maximize className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {selected && i && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-[#13131c]/95 p-4 shadow-float backdrop-blur-xl sm:inset-x-auto sm:bottom-auto sm:right-3 sm:top-3 sm:w-[320px]"
          >
            <button type="button" aria-label="Close" onClick={() => store.select(null)} className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full text-faint hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
            <p className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: i.color }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: i.color }} /> {i.kind}
            </p>
            <p className="mt-1.5 pr-8 text-[18px] font-extrabold leading-snug tracking-[-0.02em] text-white">{i.title}</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{i.detail}</p>
            <div className="mt-3 flex gap-2">
              <a href={i.gathered} target="_blank" rel="noopener" className="bg-brand inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl text-[13px] font-bold text-white">
                Read the text on Gathered <ArrowUpRight className="h-4 w-4" />
              </a>
              {i.topic && (
                <Link href={i.topic} className="inline-flex h-9 items-center gap-1 rounded-xl border border-white/10 px-3 text-[12.5px] font-semibold text-fg hover:bg-white/[0.06]">
                  <Sparkles className="h-3.5 w-3.5" /> Map
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
