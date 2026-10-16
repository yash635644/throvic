"use client";

import { Check, ChevronDown, Ellipsis, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "@/components/ui/Link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { pushRecent, useRecent } from "@/lib/recent";
import { SURPRISE_TOPICS } from "@/lib/topics";
import type { Level } from "@/lib/types";
import { streamGraph } from "../graph/api";
import type { Layout } from "../graph/engine";
import { GraphCanvas, type GraphCanvasHandle } from "../graph/GraphCanvas";
import { GraphStore } from "../graph/store";
import { IconButton } from "../ui/IconButton";
import { Logo, LogoMark } from "../ui/Logo";
import { DetailPanel, type PanelMode } from "./DetailPanel";
import { Breadcrumbs, EmptyState, Legend, FindBar, OutlinePanel, Progress, Toolbar } from "./Overlays";
import { SearchBar } from "./SearchBar";
import { ShareDialog } from "./ShareDialog";

const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: "simple", label: "Simple", hint: "Plain words, no jargon" },
  { id: "standard", label: "Standard", hint: "Clear, with key facts" },
  { id: "expert", label: "Expert", hint: "Precise technical terms" },
];

function LevelList({ level, onChange }: { level: Level; onChange: (l: Level) => void }) {
  return (
    <div role="radiogroup" aria-label="Explanation level">
      {LEVELS.map((l) => (
        <button key={l.id} type="button" role="radio" aria-checked={level === l.id} onClick={() => onChange(l.id)} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-surface-hover">
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-medium text-fg">{l.label}</span>
            <span className="block text-[12px] text-muted">{l.hint}</span>
          </span>
          {level === l.id && <Check className="h-4 w-4 text-teal" />}
        </button>
      ))}
    </div>
  );
}

function LevelMenu({ level, onChange }: { level: Level; onChange: (l: Level) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[13px] text-muted transition hover:bg-surface-hover hover:text-fg">
        Detail <span className="font-semibold text-fg">{LEVELS.find((l) => l.id === level)!.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.14 }} className="glass absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl p-1.5 shadow-float">
            <LevelList level={level} onChange={(l) => (onChange(l), setOpen(false))} />
            <p className="border-t border-line px-2.5 pb-1 pt-2 text-[11.5px] text-faint">Applies to the next map or expansion.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ExploreApp() {
  const store = useMemo(() => new GraphStore(), []);
  useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
  const canvas = useRef<GraphCanvasHandle>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* ---------- responsive layout ---------- */
  // phone: bottom sheet · tablet portrait: bottom sheet (wider content) · tablet landscape / desktop: docked panel (left)
  const phone = !useMediaQuery("(min-width: 640px)");
  const wide = useMediaQuery("(min-width: 1024px)");
  const landscape = useMediaQuery("(orientation: landscape)");
  const xl = useMediaQuery("(min-width: 1280px)");
  const panelMode: PanelMode = !phone && (wide || landscape) ? "side" : "sheet";
  const side = panelMode === "side";
  const sideWidth = xl ? 390 : 350;
  const fineHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const sideRef = useRef(side);
  useEffect(() => {
    sideRef.current = side;
  }, [side]);

  const [status, setStatus] = useState<string | null>(null);
  const [exploring, setExploring] = useState(false);
  const [expandingId, setExpandingId] = useState<string | null>(null);
  const [layout, setLayout] = useState<Layout>("force");
  const [frozen, setFrozen] = useState(false);
  const [level, setLevel] = useState<Level>("standard");
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [sheetFull, setSheetFull] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [query, setQuery] = useState("");
  const recent = useRecent();

  const selected = store.selected;
  const hasGraph = store.size > 0;
  const showEmpty = !hasGraph && !exploring;
  const sheetCovers = !side && (selected || outlineOpen);
  const path = selected ? store.pathTo(selected.id) : [];

  // Keep the camera clear of the top bar, panels, sheet and controls when fitting or centring.
  const insets = useMemo(() => {
    const top = (path.length > 1 ? 60 : 20) + 8;
    if (side) return { top, left: (selected ? sideWidth + 12 : 0) + 24, right: (outlineOpen ? 322 : 0) + 84, bottom: 24 };
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    return { top, left: 16, right: 16, bottom: selected ? vh * (sheetFull ? 0.86 : 0.47) - 40 : 96 };
  }, [side, selected, sideWidth, outlineOpen, sheetFull, path.length]);

  /* ---------- graph actions ---------- */

  const select = useCallback(
    (id: string | null, center = true) => {
      store.select(id);
      // Wait for the panel to open so the camera knows the visible area.
      if (id && center) setTimeout(() => canvas.current?.focusNode(id), 90);
      if (!id) setSheetFull(false);
    },
    [store],
  );

  const explore = useCallback(
    async (raw: string) => {
      const topic = raw.trim();
      if (!topic) return;
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      store.reset();
      setOutlineOpen(false);
      setExploring(true);
      setQuery(topic);
      setStatus(`Mapping ${topic}…`);
      let root = topic;
      let fitted = false;
      try {
        await streamGraph(
          "/api/graph/explore",
          { topic, level },
          (e) => {
            store.apply(e);
            if (e.type === "meta") {
              root = e.root;
              setQuery(e.root);
              setStatus(`Mapping ${e.root}…`);
              const url = new URL(location.href);
              url.searchParams.set("q", e.root);
              history.replaceState(null, "", url);
              document.title = `${e.root} — knowledge graph | Throvic`;
            } else if (e.type === "node") {
              setStatus(`Mapping ${root} · ${store.size} concepts`);
              if (store.size === 4 && !fitted) {
                fitted = true;
                setTimeout(() => canvas.current?.fit(), 200);
              }
            }
          },
          ctrl.signal,
        );
        pushRecent(root);
        setStatus(null);
        setAnnounce(`Map of ${root} ready with ${store.size} concepts. Tab into the map and use the arrow keys, or press O for a text outline.`);
        setTimeout(() => {
          if (store.rootId && !store.selectedId && sideRef.current) select(store.rootId, false);
          setTimeout(() => canvas.current?.fitWhenSettled(), 90);
        }, 300);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setStatus(null);
        toast.error((err as Error).message || "Couldn't map that topic. Please try again.");
      } finally {
        if (abortRef.current === ctrl) setExploring(false);
      }
    },
    [level, select, store],
  );

  const expand = useCallback(
    async (id: string) => {
      const node = store.nodeMap.get(id);
      if (!node || node.expanded || node.loading || expandingId) return;
      if (store.collapsed.has(id)) store.toggleCollapse(id);
      setExpandingId(id);
      store.setLoading(id, true);
      const before = store.size;
      const title = node.wiki?.title ?? node.title;
      setStatus(`Finding connections for ${title}…`);
      try {
        await streamGraph(
          "/api/graph/expand",
          {
            root: store.rootTitle,
            node: { id, title },
            path: store.pathTo(id).map((n) => n.wiki?.title ?? n.title),
            existing: store.nodes.map((n) => ({ id: n.id, title: n.wiki?.title ?? n.title })),
            level,
          },
          (e) => store.apply(e, id),
        );
        store.markExpanded(id);
        const added = store.size - before;
        setAnnounce(added > 0 ? `${added} new concepts added from ${title}.` : `No new concepts from ${title}.`);
        if (added > 0) toast.success(`${added} new concept${added === 1 ? "" : "s"} from ${title}`, { duration: 1800 });
        else toast("No new concepts — this one links back into your map.", { duration: 2500 });
        // Frame the new branch once it has spread out.
        const branch = [id, ...store.nodes.filter((n) => n.parent === id).map((n) => n.id)];
        setTimeout(() => canvas.current?.fitTo(branch), 700);
      } catch (err) {
        toast.error((err as Error).message || "Couldn't expand that concept.");
      } finally {
        store.setLoading(id, false);
        setExpandingId(null);
        setStatus(null);
      }
    },
    [expandingId, level, store],
  );

  const toggleCollapse = useCallback(
    (id: string) => {
      store.toggleCollapse(id);
      setTimeout(() => canvas.current?.focusNode(id), 120);
    },
    [store],
  );

  const surprise = useCallback(() => {
    const options = SURPRISE_TOPICS.filter((t) => t !== store.rootTitle);
    explore(options[Math.floor(Math.random() * options.length)]);
  }, [explore, store]);

  /* ---------- startup, URL and keyboard ---------- */

  useEffect(() => {
    // Open the topic in the URL (shared links). Deferred a tick so a development double-mount starts one request.
    const q = new URL(location.href).searchParams.get("q");
    const t = q ? setTimeout(() => explore(q), 0) : undefined;
    return () => clearTimeout(t);
    // Run once on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (shareOpen) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "f" && hasGraph) {
        e.preventDefault();
        setFindOpen(true);
        return;
      }
      const typing = e.target instanceof HTMLElement && (e.target.closest("input, textarea, select") || e.target.isContentEditable);
      if (e.key === "Escape") {
        if (findOpen) setFindOpen(false);
        else if (outlineOpen) setOutlineOpen(false);
        else if (store.selectedId) select(null);
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "f") canvas.current?.fit();
      else if (e.key === "o" && hasGraph) setOutlineOpen((o) => !o);
      else if ((e.key === "e" || e.key === "Enter") && store.selectedId) expand(store.selectedId);
      else if (e.key === "+" || e.key === "=") canvas.current?.zoomBy(1.35);
      else if (e.key === "-") canvas.current?.zoomBy(0.74);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expand, findOpen, hasGraph, outlineOpen, select, shareOpen, store]);

  // Re-fit when the layout mode changes (e.g. a tablet is rotated).
  useEffect(() => {
    if (!hasGraph) return;
    const t = setTimeout(() => canvas.current?.fit(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelMode]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-bg">
      {/* ambient light, as on the landing page */}
      <div className="pointer-events-none absolute -left-[15%] -top-[20%] h-[calc(60vh+260px)] w-[calc(55vw+260px)] animate-drift -m-[130px] glow [--glow:rgba(127,119,221,0.108)]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-[25%] -right-[10%] h-[calc(60vh+260px)] w-[calc(50vw+260px)] animate-drift-slow -m-[130px] glow [--glow:rgba(93,202,165,0.081)]" aria-hidden />

      <div className="absolute inset-0 top-16">
        <GraphCanvas
          ref={canvas}
          store={store}
          layout={layout}
          frozen={frozen}
          insets={insets}
          background={false}
          ariaLabel={store.rootTitle ? `Knowledge graph of ${store.rootTitle} with ${store.size} concepts. Use the outline for a list.` : "Empty knowledge graph"}
          onNodeClick={(id) => select(id)}
          onNodeDoubleClick={(id) => expand(id)}
          onBackgroundClick={() => side && select(null)}
        />
      </div>

      {/* top bar */}
      <header className="absolute inset-x-0 top-0 z-50 h-16 border-b border-line bg-bg/75 backdrop-blur-xl">
        <div className="flex h-full items-center gap-2 px-3 sm:gap-4 sm:px-5">
          <Link href="/" aria-label="Throvic home" className="shrink-0 rounded-xl">
            <span className="hidden sm:inline-flex">
              <Logo />
            </span>
            <LogoMark className="h-9 w-9 sm:hidden" />
          </Link>
          <div className="min-w-0 flex-1">
            {!showEmpty && (
              <SearchBar
                inputRef={searchRef}
                defaultValue={query}
                recent={recent}
                busy={exploring}
                onSubmit={explore}
                onSurprise={surprise}
                className="mx-auto max-w-xl"
                placeholder={fineHover ? "Search any topic  ( / )" : "Search any topic"}
              />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="hidden sm:block">
              <LevelMenu level={level} onChange={setLevel} />
            </span>
            <IconButton label="Share & export" onClick={() => setShareOpen(true)} disabled={!hasGraph} className="text-purple-light sm:hidden">
              <Share2 />
            </IconButton>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              disabled={!hasGraph}
              className="hidden h-10 items-center gap-2 rounded-xl border border-line bg-white/[0.04] px-3.5 text-[13.5px] font-semibold text-fg transition hover:border-purple/40 hover:bg-purple/10 disabled:opacity-40 sm:inline-flex"
            >
              <Share2 className="h-4 w-4 text-purple-light" /> Share
            </button>
            <div className="relative sm:hidden">
              <IconButton label="More" active={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
                <Ellipsis />
              </IconButton>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.14 }} className="glass absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl p-1.5 shadow-float">
                    <p className="eyebrow px-2.5 pb-1 pt-1.5">Explanation detail</p>
                    <LevelList level={level} onChange={(l) => (setLevel(l), setMenuOpen(false))} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <Progress text={status} />

      {/* path from the main topic */}
      {selected && !findOpen && !(status && !side) && (
        <div
          className={cn("pointer-events-none absolute top-[78px] z-30 flex justify-center", !side && "inset-x-3")}
          style={side ? { left: sideWidth + 28, right: (outlineOpen ? 322 : 0) + 84 } : undefined}
        >
          <div className="pointer-events-auto max-w-full">
            <Breadcrumbs path={path} onSelect={(id) => select(id)} />
          </div>
        </div>
      )}

      <AnimatePresence>
        {showEmpty && <EmptyState onPick={explore} recent={recent} search={<SearchBar size="lg" recent={recent} onSubmit={explore} onSurprise={surprise} autoFocus={fineHover} placeholder="Try “photosynthesis” or “Mughal Empire”" />} />}
      </AnimatePresence>

      {/* controls */}
      <AnimatePresence>
        {hasGraph && !sheetCovers && (
          <Toolbar
            key="toolbar"
            vertical={side}
            className={cn("absolute", side ? "bottom-3 right-3" : "safe-bottom bottom-3 left-1/2 -translate-x-1/2")}
            layout={layout}
            onLayout={setLayout}
            frozen={frozen}
            onFrozen={setFrozen}
            onZoom={(f) => canvas.current?.zoomBy(f)}
            onFit={() => canvas.current?.fit()}
            outlineOpen={outlineOpen}
            onOutline={() => setOutlineOpen((o) => !o)}
            onShare={() => setShareOpen(true)}
            findOpen={findOpen}
            onFind={() => setFindOpen((o) => !o)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasGraph && findOpen && (
          <FindBar
            key="find"
            store={store}
            onPick={(id) => select(id)}
            onClose={() => setFindOpen(false)}
            className={cn("absolute top-[76px]", !side && "inset-x-3")}
            style={side ? { left: (selected ? sideWidth : 0) + 28, width: 420 } : undefined}
          />
        )}
      </AnimatePresence>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      {hasGraph && !phone && !(outlineOpen && side) && <Legend store={store} className="absolute right-3 top-[76px]" />}

      <OutlinePanel store={store} open={outlineOpen} sheet={!side} onClose={() => setOutlineOpen(false)} onToggleCollapse={toggleCollapse} onSelect={(id) => (!side && setOutlineOpen(false), select(id))} />

      <DetailPanel
        store={store}
        node={selected}
        mode={panelMode}
        width={sideWidth}
        sheetFull={sheetFull}
        onSheetFull={setSheetFull}
        onClose={() => select(null)}
        onExpand={expand}
        onSelect={(id) => select(id)}
        onNewMap={explore}
        onToggleCollapse={toggleCollapse}
        expanding={!!expandingId}
        showShortcuts={fineHover}
      />

      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} store={store} sheet={phone} />
    </div>
  );
}
