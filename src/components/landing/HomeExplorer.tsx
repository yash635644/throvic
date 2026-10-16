"use client";

import { ArrowRight, ArrowUpRight, BadgeCheck, Hand, LoaderCircle, Maximize, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "@/components/ui/Link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CATEGORIES, type Category } from "@/lib/categories";
import { useRecent } from "@/lib/recent";
import { exploreUrl } from "@/lib/site";
import { STARTER_TOPICS } from "@/lib/topics";
import { SearchBar } from "../explore/SearchBar";
import { streamGraph } from "../graph/api";
import type { GraphCanvasHandle } from "../graph/GraphCanvas";
import { GraphStore } from "../graph/store";

// The physics engine loads after the headline has painted, so it never delays the first view.
const GraphCanvas = dynamic(() => import("../graph/GraphCanvas").then((m) => m.GraphCanvas), { ssr: false });

/**
 * The home page's first screen: a working mini explorer. It opens instantly with a ready-made map,
 * can be dragged, zoomed and tapped, and searching builds a live map right here.
 */

type Seed = [title: string, category: Category, parent: string | null, label: string, summary: string];
const DEMO: Seed[] = [
  ["Black hole", "science", null, "", "A region of spacetime where gravity is so strong that nothing, not even light, can escape."],
  ["General relativity", "science", "Black hole", "predicted by", "Einstein's theory of gravity as the curvature of spacetime."],
  ["Event horizon", "science", "Black hole", "bounded by", "The boundary beyond which nothing can escape a black hole."],
  ["Stephen Hawking", "people", "Black hole", "studied by", "English theoretical physicist known for his work on black holes."],
  ["Hawking radiation", "science", "Stephen Hawking", "proposed", "Radiation predicted to be released by black holes due to quantum effects."],
  ["Albert Einstein", "people", "General relativity", "developed by", "Physicist who developed the theory of relativity."],
  ["Gravitational wave", "science", "General relativity", "predicts", "Ripples in spacetime caused by accelerating masses."],
  ["LIGO", "technology", "Gravitational wave", "detected by", "Observatory that first detected gravitational waves in 2015."],
  ["Sagittarius A*", "nature", "Black hole", "example", "The supermassive black hole at the centre of the Milky Way."],
  ["Milky Way", "nature", "Sagittarius A*", "centre of", "The galaxy that contains our Solar System."],
  ["Interstellar (film)", "culture", "Black hole", "depicted in", "2014 film by Christopher Nolan featuring a realistic black hole."],
  ["Quasar", "science", "Black hole", "powered by", "Extremely bright galactic nucleus powered by a supermassive black hole."],
  ["Event Horizon Telescope", "technology", "Event horizon", "imaged by", "Telescope array that took the first image of a black hole."],
];
const key = (t: string) => t.toLowerCase();

const CHIPS = ["Stoicism", "CRISPR", "Constitution of India", "Jazz", "Roman Empire"];

export function HomeExplorer() {
  const store = useMemo(() => new GraphStore(), []);
  useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
  const canvas = useRef<GraphCanvasHandle>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recent = useRecent();
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const wide = useMediaQuery("(min-width: 1024px)");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(true);
  const selected = store.selected;

  // Ready-made map, grown quickly so the first screen feels alive. It starts once the browser is idle
  // after loading, so the physics never competes with the page becoming usable.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = () => DEMO.forEach(([title, category, parent, label, summary], i) => {
      const add = () => {
        store.addNode({ id: key(title), title, category, summary, wiki: null }, parent ? key(parent) : undefined);
        if (parent) {
          store.addLink({ source: key(parent), target: key(title), label });
          if (parent !== DEMO[0][0]) store.markExpanded(key(parent));
        }
        if (i === 3) canvas.current?.fit();
        if (i === DEMO.length - 1) canvas.current?.fitWhenSettled();
      };
      if (reduced) add();
      else timers.push(setTimeout(add, i * 160));
    });
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 400));
    const cancelIdle = window.cancelIdleCallback ?? clearTimeout;
    const handle = idle(() => {
      start();
      if (reduced) timers.push(setTimeout(() => canvas.current?.fit(false), 300));
    }, { timeout: 1500 });
    return () => {
      cancelIdle(handle as number);
      timers.forEach(clearTimeout);
    };
  }, [store]);

  const explore = useCallback(
    async (raw: string) => {
      const topic = raw.trim();
      if (!topic) return;
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      store.reset();
      setDemo(false);
      setBusy(true);
      setStatus(`Mapping ${topic}…`);
      let root = topic;
      try {
        await streamGraph(
          "/api/graph/explore",
          { topic, level: "standard" },
          (e) => {
            store.apply(e);
            if (e.type === "meta") root = e.root;
            if (e.type === "node") {
              setStatus(`Mapping ${root} · ${store.size} concepts`);
              if (store.size === 4) setTimeout(() => canvas.current?.fit(), 150);
            }
          },
          ctrl.signal,
        );
        setStatus(null);
        setTimeout(() => canvas.current?.fitWhenSettled(), 200);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setStatus((err as Error).message || "Couldn't map that topic.");
      } finally {
        if (abortRef.current === ctrl) setBusy(false);
      }
    },
    [store],
  );

  const cat = selected ? (CATEGORIES[selected.category] ?? CATEGORIES.other) : null;
  const rootTitle = store.rootTitle || DEMO[0][0];

  return (
    <section className="relative flex min-h-[640px] flex-col pt-[84px] sm:pt-24 lg:h-[100svh] lg:max-h-[1000px]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -left-[10%] -top-[25%] h-[calc(60vh+260px)] w-[calc(50vw+260px)] animate-drift -m-[130px] glow [--glow:rgba(127,119,221,0.225)]" />
        <div className="absolute -right-[10%] top-[30%] h-[calc(55vh+260px)] w-[calc(45vw+260px)] animate-drift-slow -m-[130px] glow [--glow:rgba(93,202,165,0.135)]" />
      </div>

      {/* headline band */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="rise max-w-2xl">
            <p className="mb-2.5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-teal">Free AI knowledge graph &amp; mind map explorer</p>
            <h1 className="text-[40px] font-extrabold leading-[1.02] tracking-[-0.045em] text-white sm:text-[56px] xl:text-[64px]">
              The thrill of <span className="text-brand pb-[0.08em] sm:block">knowing more.</span>
            </h1>
            <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-muted sm:text-[17px]">
              Search any topic and watch it unfold into a living knowledge graph — every concept verified on Wikipedia.
            </p>
          </div>
          <div className="rise-2 w-full lg:max-w-[460px]">
            <SearchBar onSubmit={explore} recent={recent} busy={busy} placeholder="Try black holes, jazz, CRISPR…" className="relative z-30" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {CHIPS.map((c) => {
                const color = CATEGORIES[STARTER_TOPICS.find((t) => t.title === c)?.category ?? "other"].color;
                return (
                  <button key={c} type="button" onClick={() => explore(c)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-medium text-muted transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* the live graph */}
      <div
        className="rise-3 relative mx-2 mb-2 mt-5 h-[62svh] min-h-[420px] overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0b0b12]/70 sm:mx-4 sm:mb-4 sm:rounded-[28px] lg:mt-7 lg:h-auto lg:flex-1"
      >
        <GraphCanvas
          // Remount when the pointer type is known: zoom/pan only with a mouse, so touch scrolls the page.
          key={fine ? "pointer" : "touch"}
          ref={canvas}
          store={store}
          interactive={fine}
          background={false}
          labels={store.size <= 30 ? "all" : "auto"}
          maxFitScale={1.9}
          insets={{ top: 64, right: 24, bottom: 64, left: selected && wide ? 340 : 24 }}
          ariaLabel={`Knowledge graph of ${rootTitle}`}
          onNodeClick={(id) => store.select(id)}
          onBackgroundClick={() => store.select(null)}
        />

        {/* top overlays */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3 sm:inset-x-4 sm:top-4">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-[#0d0d14]/80 py-1.5 pl-3 pr-3.5 text-[13px] backdrop-blur-md">
            {busy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-teal" /> : <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_8px_#5dcaa5]" />}
            <span className="font-semibold text-white">{status ?? rootTitle}</span>
            {!status && <span className="hidden text-faint sm:inline">· {store.size} concepts{demo ? " · example" : ""}</span>}
          </div>
          <Link
            href={exploreUrl(rootTitle)}
            className="bg-brand pointer-events-auto inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-bold text-white shadow-glow transition hover:brightness-110"
          >
            <span className="hidden sm:inline">Open full explorer</span>
            <span className="sm:hidden">Open</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* hint */}
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-white/10 bg-[#0d0d14]/70 px-3 py-1.5 text-[12px] text-muted backdrop-blur-md sm:bottom-4 sm:right-4">
          <Hand className="h-3.5 w-3.5" /> {fine ? "Drag, scroll to zoom, click a concept" : "Tap a concept to read it"}
          {fine && (
            <button type="button" aria-label="Fit to screen" onClick={() => canvas.current?.fit()} className="pointer-events-auto -mr-1 ml-1 grid h-6 w-6 place-items-center rounded-full hover:bg-white/10 hover:text-white">
              <Maximize className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* concept card */}
        <AnimatePresence>
          {selected && cat && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-[#13131c]/95 p-4 shadow-float backdrop-blur-xl sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[320px] lg:bottom-auto lg:top-[68px]"
            >
              <button type="button" aria-label="Close" onClick={() => store.select(null)} className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full text-faint hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </button>
              <p className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: cat.color }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.color }} />
                {cat.label}
                {selected.depth > 0 && <span className="font-medium text-faint">· Level {selected.depth}</span>}
              </p>
              <h3 className="mt-1.5 pr-8 text-[20px] font-extrabold tracking-[-0.02em] text-white">{selected.wiki?.title ?? selected.title}</h3>
              {selected.wiki && (
                <span className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-teal">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified on Wikipedia
                </span>
              )}
              {selected.summary && <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-muted">{selected.summary}</p>}
              <div className="mt-3.5 flex gap-2">
                <Link href={exploreUrl(selected.wiki?.title ?? selected.title)} className="bg-brand inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[13.5px] font-bold text-white">
                  <Sparkles className="h-4 w-4" /> Explore this
                </Link>
                {selected.wiki?.url && (
                  <a href={selected.wiki.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1 rounded-xl border border-white/10 px-3 text-[13px] font-semibold text-fg hover:bg-white/[0.06]">
                    Wiki <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <a href="#how-it-works" className="mx-auto mb-2 hidden items-center gap-1.5 text-[13px] font-medium text-faint transition hover:text-white lg:inline-flex">
        How it works <ArrowRight className="h-3.5 w-3.5 rotate-90" />
      </a>
    </section>
  );
}
