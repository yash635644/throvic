"use client";

import { ArrowRight, ChevronDown, ChevronRight, Clock, ListTree, Maximize, Minus, Network, Orbit, Pause, Play, Plus, Search, Share2, Workflow, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, CATEGORY_KEYS, type Category } from "@/lib/categories";
import { cn } from "@/lib/cn";
import { STARTER_TOPICS } from "@/lib/topics";
import { IconButton } from "../ui/IconButton";
import type { Layout } from "../graph/engine";
import type { GraphStore, SimNode } from "../graph/store";

/* ---------------- Control rail ---------------- */

const LAYOUTS: { id: Layout; label: string; Icon: typeof Network }[] = [
  { id: "force", label: "Web", Icon: Network },
  { id: "radial", label: "Radial", Icon: Orbit },
  { id: "tree", label: "Tree", Icon: Workflow },
];

export function Toolbar({
  vertical,
  layout,
  onLayout,
  frozen,
  onFrozen,
  onZoom,
  onFit,
  onOutline,
  outlineOpen,
  onShare,
  onFind,
  findOpen,
  className,
  style,
}: {
  vertical: boolean;
  layout: Layout;
  onLayout: (l: Layout) => void;
  frozen: boolean;
  onFrozen: (f: boolean) => void;
  onZoom: (factor: number) => void;
  onFit: () => void;
  onOutline: () => void;
  outlineOpen: boolean;
  onShare: () => void;
  onFind: () => void;
  findOpen: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const current = LAYOUTS.find((l) => l.id === layout) ?? LAYOUTS[0];
  const sep = <span className={cn("bg-line", vertical ? "mx-2 my-1 h-px" : "mx-1 h-6 w-px")} aria-hidden />;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="toolbar"
      aria-label="Graph controls"
      aria-orientation={vertical ? "vertical" : "horizontal"}
      style={style}
      className={cn("glass z-20 flex rounded-2xl p-1.5 shadow-float", vertical ? "flex-col" : "flex-row items-center", className)}
    >
      {/* Touch screens pinch to zoom, so the buttons only take room there. */}
      <IconButton label="Zoom in" onClick={() => onZoom(1.35)} className="pointer-coarse:hidden">
        <Plus />
      </IconButton>
      <IconButton label="Zoom out" onClick={() => onZoom(0.74)} className="pointer-coarse:hidden">
        <Minus />
      </IconButton>
      <IconButton label="Fit to screen (F)" onClick={onFit}>
        <Maximize />
      </IconButton>
      {sep}
      <div className="relative">
        <IconButton label={`Layout: ${current.label}`} active={open} onClick={() => setOpen((o) => !o)}>
          <current.Icon />
        </IconButton>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.14 }}
              className={cn("glass absolute z-50 w-44 rounded-2xl p-1.5 shadow-float", vertical ? "right-full top-0 mr-2" : "bottom-full left-1/2 mb-2 -translate-x-1/2")}
            >
              <p className="eyebrow px-2.5 pb-1.5 pt-1">Layout</p>
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => (onLayout(l.id), setOpen(false))}
                  className={cn("flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] text-fg transition hover:bg-surface-hover", layout === l.id && "bg-purple/15 text-purple-light")}
                >
                  <l.Icon className="h-4 w-4" /> {l.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <IconButton label={frozen ? "Resume motion" : "Pause motion"} active={frozen} onClick={() => onFrozen(!frozen)}>
        {frozen ? <Play /> : <Pause />}
      </IconButton>
      <IconButton label="Find in map (Ctrl+F)" active={findOpen} onClick={onFind}>
        <Search />
      </IconButton>
      <IconButton label="Outline (O)" active={outlineOpen} onClick={onOutline}>
        <ListTree />
      </IconButton>
      {sep}
      <IconButton label="Share & export" onClick={onShare} className="text-purple-light">
        <Share2 />
      </IconButton>
    </motion.div>
  );
}

/* ---------------- Find in map ---------------- */

/** Highlights concepts whose name matches; Enter steps through them. */
export function FindBar({ store, onPick, onClose, className, style }: { store: GraphStore; onPick: (id: string) => void; onClose: () => void; className?: string; style?: React.CSSProperties }) {
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const term = q.trim().toLowerCase();
  const matches = term ? store.visibleNodes.filter((n) => n.title.toLowerCase().includes(term) || n.wiki?.title.toLowerCase().includes(term)) : [];
  const key = matches.map((m) => m.id).join("|");

  useEffect(() => input.current?.focus(), []);
  useEffect(() => {
    store.setHighlight(key ? new Set(key.split("|")) : null);
  }, [key, store]);
  useEffect(() => () => store.setHighlight(null), [store]);

  const go = (step: number) => {
    if (!matches.length) return;
    const i = (((index + step) % matches.length) + matches.length) % matches.length;
    setIndex(i);
    onPick(matches[i].id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      role="search"
      style={style}
      className={cn("glass z-40 flex items-center gap-1 rounded-2xl p-1.5 pl-3 shadow-float", className)}
    >
      <Search className="h-4 w-4 shrink-0 text-faint" aria-hidden />
      <input
        ref={input}
        value={q}
        onChange={(e) => (setQ(e.target.value), setIndex(-1))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            go(e.shiftKey ? -1 : 1);
          } else if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
          }
        }}
        placeholder="Find in this map"
        aria-label="Find a concept in this map"
        enterKeyHint="search"
        className="h-10 min-w-0 flex-1 bg-transparent focus-visible:outline-none text-[16px] text-fg outline-none placeholder:text-faint sm:text-[14.5px]"
      />
      <span className="shrink-0 px-1 text-[12.5px] font-semibold tabular-nums text-muted" aria-live="polite">
        {term ? (matches.length ? `${index >= 0 ? index + 1 : 0}/${matches.length}` : "None") : ""}
      </span>
      <IconButton label="Previous match" onClick={() => go(-1)} disabled={!matches.length} className="max-sm:hidden">
        <ChevronDown className="rotate-180" />
      </IconButton>
      <IconButton label="Next match" onClick={() => go(1)} disabled={!matches.length}>
        <ChevronDown />
      </IconButton>
      <IconButton label="Close find" onClick={onClose}>
        <X />
      </IconButton>
    </motion.div>
  );
}

/* ---------------- Legend + stats ---------------- */

export function Legend({ store, className, style }: { store: GraphStore; className?: string; style?: React.CSSProperties }) {
  const [open, setOpen] = useState(true);
  const counts = new Map<Category, number>();
  for (const n of store.nodes) counts.set(n.category, (counts.get(n.category) ?? 0) + 1);
  const present = CATEGORY_KEYS.filter((c) => counts.has(c));
  if (!present.length) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={style} className={cn("glass z-20 w-52 rounded-2xl p-1.5 shadow-float", className)}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left hover:bg-surface-hover">
        <span>
          <span className="block font-display text-[15px] font-bold text-fg tabular-nums">
            {store.size} <span className="text-[12px] font-medium text-muted">concepts</span>
            <span className="mx-1.5 text-faint">·</span>
            {store.maxDepth + 1} <span className="text-[12px] font-medium text-muted">level{store.maxDepth ? "s" : ""}</span>
          </span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-faint transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-2.5 pb-1.5">
            {present.map((c) => (
              <li key={c} className="flex items-center gap-2.5 py-1 text-[12.5px] text-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: CATEGORIES[c].color, boxShadow: `0 0 8px ${CATEGORIES[c].color}` }} />
                <span className="flex-1">{CATEGORIES[c].label}</span>
                <span className="tabular-nums text-faint">{counts.get(c)}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---------------- Breadcrumbs ---------------- */

export function Breadcrumbs({ path, onSelect, className }: { path: SimNode[]; onSelect: (id: string) => void; className?: string }) {
  if (path.length < 2) return null;
  return (
    <motion.nav aria-label="Path from the main topic" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className={cn("glass z-20 flex max-w-full items-center overflow-x-auto rounded-full px-1.5 py-1 shadow-float no-scrollbar", className)}>
      {path.map((n, i) => {
        const last = i === path.length - 1;
        return (
          <span key={n.id} className="flex shrink-0 items-center">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-faint" aria-hidden />}
            <button
              type="button"
              onClick={() => onSelect(n.id)}
              aria-current={last ? "location" : undefined}
              className={cn("flex max-w-[170px] items-center gap-1.5 truncate rounded-full px-2.5 py-1 text-[12.5px] transition", last ? "bg-white/[0.07] font-semibold text-fg" : "text-muted hover:text-fg")}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: (CATEGORIES[n.category] ?? CATEGORIES.other).color }} />
              <span className="truncate">{n.wiki?.title ?? n.title}</span>
            </button>
          </span>
        );
      })}
    </motion.nav>
  );
}

/* ---------------- Progress ---------------- */

export function Progress({ text }: { text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-0 top-16 z-40 h-[2px] overflow-hidden" aria-hidden>
            <div className="bg-brand h-full w-2/5 animate-indeterminate" />
          </motion.div>
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="glass pointer-events-none absolute left-1/2 top-[78px] z-30 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium text-fg shadow-float"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
            </span>
            {text}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Outline (tree view with folding) ---------------- */

export function OutlinePanel({
  store,
  open,
  onClose,
  onSelect,
  onToggleCollapse,
  sheet,
}: {
  store: GraphStore;
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  sheet: boolean;
}) {
  const [filter, setFilter] = useState("");
  const tree = useMemo(() => {
    const children = new Map<string | undefined, SimNode[]>();
    for (const n of store.nodes) {
      const key = n.depth === 0 ? "__root" : n.parent;
      children.set(key, [...(children.get(key) ?? []), n]);
    }
    const rows: { node: SimNode; level: number; kids: number }[] = [];
    const walk = (parent: string | undefined, level: number) => {
      for (const n of children.get(parent) ?? []) {
        const kids = children.get(n.id)?.length ?? 0;
        rows.push({ node: n, level, kids });
        if (!store.collapsed.has(n.id)) walk(n.id, level + 1);
      }
    };
    walk("__root", 0);
    // Concepts whose parent was merged away still appear.
    const seen = new Set(rows.map((r) => r.node.id));
    for (const n of store.visibleNodes) if (!seen.has(n.id)) rows.push({ node: n, level: 1, kids: 0 });
    return rows;
    // store.version drives recomputation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.version, store]);
  const q = filter.trim().toLowerCase();
  const rows = q ? store.nodes.filter((n) => n.title.toLowerCase().includes(q) || n.wiki?.title.toLowerCase().includes(q)).map((node) => ({ node, level: 0, kids: 0 })) : tree;

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          aria-label="Outline"
          initial={sheet ? { y: "100%" } : { x: 340, opacity: 0 }}
          animate={sheet ? { y: 0 } : { x: 0, opacity: 1 }}
          exit={sheet ? { y: "100%" } : { x: 340, opacity: 0 }}
          transition={{ type: "spring", damping: 34, stiffness: 340 }}
          className={cn("glass z-40 flex flex-col shadow-float", sheet ? "fixed inset-x-0 bottom-0 h-[78dvh] rounded-t-[28px]" : "absolute bottom-3 right-[76px] top-[76px] w-[310px] rounded-[24px]")}
        >
          <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
            <h2 className="font-display text-[17px] font-bold text-fg">
              Outline <span className="ml-1 text-[13px] font-medium text-faint tabular-nums">{store.size}</span>
            </h2>
            <IconButton label="Close outline" onClick={onClose}>
              <X />
            </IconButton>
          </div>
          <div className="px-3 pb-2">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-3 focus-within:border-purple/50">
              <Search className="h-4 w-4 text-faint" />
              <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Find a concept" className="min-w-0 flex-1 bg-transparent text-[13.5px] text-fg outline-none placeholder:text-faint" />
            </label>
          </div>
          <ul className="safe-bottom thin-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4">
            {rows.map(({ node, level, kids }) => {
              const folded = store.collapsed.has(node.id);
              return (
                <li key={node.id} className="relative" style={{ paddingLeft: q ? 0 : level * 14 }}>
                  {level > 0 && !q && <span className="absolute bottom-0 top-0 w-px bg-line" style={{ left: level * 14 - 5 }} aria-hidden />}
                  <div className={cn("group flex items-center rounded-xl transition hover:bg-surface-hover", store.selectedId === node.id && "bg-purple/12")}>
                    {kids > 0 && !q ? (
                      <button type="button" aria-label={folded ? "Unfold branch" : "Fold branch"} onClick={() => onToggleCollapse(node.id)} className="grid h-8 w-6 shrink-0 place-items-center text-faint hover:text-fg">
                        <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", !folded && "rotate-90")} />
                      </button>
                    ) : (
                      <span className="w-6 shrink-0" />
                    )}
                    <button type="button" onClick={() => onSelect(node.id)} className="flex min-w-0 flex-1 items-center gap-2.5 py-2 pr-2 text-left">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: (CATEGORIES[node.category] ?? CATEGORIES.other).color }} />
                      <span className={cn("min-w-0 flex-1 truncate text-[13.5px]", level === 0 && !q ? "font-semibold text-fg" : "text-fg/85")}>{node.wiki?.title ?? node.title}</span>
                      {folded && <span className="rounded-full bg-white/[0.06] px-1.5 text-[10.5px] font-semibold text-muted">+{store.hiddenCount(node.id)}</span>}
                    </button>
                  </div>
                </li>
              );
            })}
            {!rows.length && <li className="px-3 py-6 text-center text-[13px] text-muted">No concepts match “{filter}”.</li>}
          </ul>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Empty state ---------------- */

export function EmptyState({ search, onPick, recent }: { search: React.ReactNode; onPick: (topic: string) => void; recent: string[] }) {
  return (
    <motion.div initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.985 }} transition={{ duration: 0.3 }} className="thin-scrollbar absolute inset-0 top-16 z-10 overflow-y-auto">
      <div className="pointer-events-none absolute left-1/2 top-[10%] h-[calc(360px+220px)] w-[calc(640px+220px)] -translate-x-1/2 -my-[110px] glow [--glow:rgba(127,119,221,0.135)]" aria-hidden />
      <div className="relative mx-auto flex min-h-full max-w-3xl flex-col justify-center px-5 py-12 text-center">
        <div className="rise">
          <h1 className="font-display text-[38px] font-bold leading-[1.05] tracking-[-0.03em] text-fg sm:text-[56px]">
            Where does your <span className="text-brand">curiosity</span> go?
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-muted sm:text-[17px]">Search any topic to see its key ideas, people and events — and how they connect. Tap a concept to read it, expand it to go deeper.</p>
        </div>
        <div className="rise-2 mx-auto mt-8 w-full max-w-xl text-left">{search}</div>

        {recent.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Clock className="h-4 w-4 text-faint" aria-label="Recent" />
            {recent.slice(0, 5).map((t) => (
              <button key={t} type="button" onClick={() => onPick(t)} className="rounded-full border border-line bg-white/[0.03] px-3.5 py-1.5 text-[13px] text-fg/90 transition hover:border-purple/40 hover:bg-purple/10">
                {t}
              </button>
            ))}
          </motion.div>
        )}

        <div className="mt-12 text-left">
          <p className="eyebrow mb-3 text-center">Or start with</p>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {STARTER_TOPICS.slice(0, 9).map((t, i) => {
              const color = CATEGORIES[t.category].color;
              return (
                <motion.button
                  key={t.title}
                  type="button"
                  onClick={() => onPick(t.title)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.04, type: "spring", damping: 24, stiffness: 260 }}
                  whileHover={{ y: -3 }}
                  className="group relative overflow-hidden rounded-2xl border border-line bg-white/[0.025] p-4 text-left transition-colors hover:border-line-strong"
                >
                  <span className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40" style={{ background: color }} />
                  <span className="relative flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                      {CATEGORIES[t.category].label}
                    </span>
                    <ArrowRight className="h-4 w-4 -translate-x-1 text-faint opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                  </span>
                  <span className="relative mt-2 block font-display text-[17px] font-bold text-fg">{t.title}</span>
                  <span className="relative block text-[13px] text-muted">{t.hint}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
