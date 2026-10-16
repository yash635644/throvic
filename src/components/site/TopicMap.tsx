"use client";

import { ArrowUpRight, BadgeCheck, Hand, Maximize, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "@/components/ui/Link";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CATEGORIES } from "@/lib/categories";
import { exploreUrl } from "@/lib/site";
import type { GraphSnapshot } from "@/lib/types";
import { GraphCanvas, type GraphCanvasHandle } from "../graph/GraphCanvas";
import { GraphStore } from "../graph/store";

/**
 * The interactive map on a topic page. Built from the server's snapshot (no API call), so it shows
 * instantly; concepts that have their own topic page link there, others open in the explorer.
 */
export function TopicMap({ snapshot, topicLinks }: { snapshot: GraphSnapshot; topicLinks: Record<string, string> }) {
  const store = useMemo(() => new GraphStore(), []);
  useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
  const canvas = useRef<GraphCanvasHandle>(null);
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const selected = store.selected;

  useEffect(() => {
    if (store.size) return;
    const root = snapshot.nodes[0];
    snapshot.nodes.forEach((n, i) => store.addNode(n, i === 0 ? undefined : root?.id));
    snapshot.links.forEach((l) => store.addLink(l));
    const t = setTimeout(() => canvas.current?.fitWhenSettled(), 150);
    return () => clearTimeout(t);
  }, [snapshot, store]);

  const cat = selected ? (CATEGORIES[selected.category] ?? CATEGORIES.other) : null;
  const title = selected ? (selected.wiki?.title ?? selected.title) : "";
  const pageHref = selected ? topicLinks[selected.id] : undefined;

  return (
    <div className="relative h-[440px] overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0b0b12]/70 sm:h-[520px]">
      <GraphCanvas
        key={fine ? "pointer" : "touch"}
        ref={canvas}
        store={store}
        interactive={fine}
        background={false}
        labels="all"
        maxFitScale={1.8}
        insets={{ top: 24, right: 24, bottom: 56, left: 24 }}
        ariaLabel={`Knowledge map of ${snapshot.root}`}
        onNodeClick={(id) => store.select(id)}
        onBackgroundClick={() => store.select(null)}
      />
      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/10 bg-[#0d0d14]/75 px-3 py-1.5 text-[12px] text-muted backdrop-blur-md">
        <Hand className="h-3.5 w-3.5" /> {fine ? "Drag, scroll to zoom, click a concept" : "Tap a concept"}
        {fine && (
          <button type="button" aria-label="Fit to screen" onClick={() => canvas.current?.fit()} className="pointer-events-auto -mr-1 ml-1 grid h-6 w-6 place-items-center rounded-full hover:bg-white/10 hover:text-white">
            <Maximize className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <Link href={exploreUrl(snapshot.root)} className="bg-brand absolute right-3 top-3 inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold text-white shadow-glow transition hover:brightness-110">
        Expand in explorer <ArrowUpRight className="h-4 w-4" />
      </Link>
      <AnimatePresence>
        {selected && cat && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-[#13131c]/95 p-4 shadow-float backdrop-blur-xl sm:inset-x-auto sm:left-3 sm:top-3 sm:bottom-auto sm:w-[300px]"
          >
            <button type="button" aria-label="Close" onClick={() => store.select(null)} className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full text-faint hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
            <p className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: cat.color }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.color }} /> {cat.label}
            </p>
            <p className="mt-1.5 pr-8 text-[18px] font-extrabold tracking-[-0.02em] text-white">{title}</p>
            {selected.wiki && (
              <span className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-teal">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified on Wikipedia
              </span>
            )}
            {selected.summary && <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-muted">{selected.summary}</p>}
            <div className="mt-3 flex gap-2">
              <Link href={pageHref ?? exploreUrl(title)} className="bg-brand inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl text-[13px] font-bold text-white">
                <Sparkles className="h-4 w-4" /> {pageHref ? "Open topic page" : "Explore this"}
              </Link>
              {selected.wiki?.url && (
                <a href={selected.wiki.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1 rounded-xl border border-white/10 px-3 text-[12.5px] font-semibold text-fg hover:bg-white/[0.06]">
                  Wiki <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
