"use client";

import { ArrowUpRight, BadgeCheck, ChevronDown, ChevronsDownUp, ChevronsUpDown, Compass, CornerLeftUp, LoaderCircle, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/cn";
import type { GraphStore, SimNode } from "../graph/store";

export type PanelMode = "sheet" | "side";

interface Props {
  store: GraphStore;
  node: SimNode | null;
  mode: PanelMode;
  /** Side panel width in px (side mode). */
  width: number;
  sheetFull: boolean;
  onSheetFull: (full: boolean) => void;
  onClose: () => void;
  onExpand: (id: string) => void;
  onSelect: (id: string) => void;
  onNewMap: (title: string) => void;
  onToggleCollapse: (id: string) => void;
  expanding: boolean;
  showShortcuts: boolean;
}

/**
 * The article image, shown so nothing important is lost:
 * - photos fill the frame, anchored near the top so faces stay in view;
 * - tall portraits and graphics (diagrams, logos, maps, flags) are shown whole, over a soft
 *   blurred copy of themselves (photos) or a light card (graphics).
 * Falls back to the small thumbnail if the sharper image fails, and hides itself if both fail.
 */
function ArticleImage({ wiki, alt, wide }: { wiki: NonNullable<SimNode["wiki"]>; alt: string; wide: boolean }) {
  const sources = [wiki.image, wiki.thumb].filter((u, i, a): u is string => !!u && a.indexOf(u) === i);
  const [index, setIndex] = useState(0);
  const src = sources[index];
  if (!src) return null;
  const portrait = !!wiki.imageW && !!wiki.imageH && wiki.imageH > wiki.imageW * 1.05;
  const graphic = wiki.imageKind === "graphic";
  const whole = graphic || portrait;
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-line", graphic ? "bg-[#ecebf3]" : "bg-deep", wide ? "aspect-[4/3]" : "aspect-[16/10]")}>
      {whole && !graphic && <img src={src} alt="" crossOrigin="anonymous" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover opacity-45 blur-2xl" />}
      <motion.img
        crossOrigin="anonymous"
        key={src}
        src={src}
        alt={alt}
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        onError={() => setIndex((i) => i + 1)}
        className={cn("relative h-full w-full", whole ? "object-contain" : "object-cover object-[50%_25%]", graphic && "p-5")}
      />
      {!graphic && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />}
    </div>
  );
}

function Row({ node, label, onSelect }: { node: SimNode; label?: string; onSelect: (id: string) => void }) {
  const color = (CATEGORIES[node.category] ?? CATEGORIES.other).color;
  return (
    <li>
      <button type="button" onClick={() => onSelect(node.id)} className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-surface-hover">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}66` }} />
        <span className="min-w-0 flex-1 truncate text-[14px] text-fg/90 group-hover:text-fg">{node.wiki?.title ?? node.title}</span>
        {label && <span className="max-w-[46%] shrink-0 truncate text-[12px] text-faint">{label}</span>}
      </button>
    </li>
  );
}

function Body({ store, node, onExpand, onSelect, onNewMap, onToggleCollapse, expanding, showShortcuts, wide }: Omit<Props, "node" | "mode" | "width" | "sheetFull" | "onSheetFull" | "onClose"> & { node: SimNode; wide: boolean }) {
  const [showExtract, setShowExtract] = useState(false);
  const cat = CATEGORIES[node.category] ?? CATEGORIES.other;
  const wiki = node.wiki;
  const title = wiki?.title ?? node.title;
  const parent = node.parent ? store.nodeMap.get(node.parent) : null;
  const children = store.nodes.filter((n) => n.parent === node.id);
  const childIds = new Set(children.map((c) => c.id));
  const others = store.connections(node.id).filter((c) => !childIds.has(c.node.id) && c.node.id !== node.parent);
  const collapsed = store.collapsed.has(node.id);
  const hidden = collapsed ? store.hiddenCount(node.id) : 0;

  const header = (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: `${cat.color}1f`, color: cat.color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.color }} />
          {cat.label}
        </span>
        <span className="rounded-full bg-surface-hover px-2.5 py-1 text-[11.5px] font-medium text-muted">{node.depth === 0 ? "Main topic" : `Level ${node.depth}`}</span>
      </div>
      <h2 className="mt-3 font-display text-[26px] font-bold leading-[1.12] tracking-[-0.02em] text-fg">{title}</h2>
      {wiki?.description && <p className="mt-1 text-[14px] text-muted first-letter:uppercase">{wiki.description}</p>}
      <div className="mt-3">
        {wiki === undefined ? (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-faint">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Checking Wikipedia…
          </span>
        ) : wiki ? (
          <a href={wiki.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-teal/12 px-2.5 py-1 text-[12px] font-semibold text-teal transition hover:bg-teal/20">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified on Wikipedia <ArrowUpRight className="h-3 w-3" />
          </a>
        ) : (
          <span className="inline-flex rounded-full bg-surface-hover px-2.5 py-1 text-[12px] text-muted">No matching Wikipedia article</span>
        )}
      </div>
    </div>
  );

  const image = wiki && (wiki.image || wiki.thumb) ? <ArticleImage key={wiki.image ?? wiki.thumb} wiki={wiki} alt={title} wide={wide} /> : null;

  return (
    <div className="flex flex-col gap-5">
      {wide && image ? (
        <div className="grid grid-cols-[1fr_210px] gap-5">
          {header}
          {image}
        </div>
      ) : (
        <>
          {image}
          {header}
        </>
      )}

      {parent && (
        <button type="button" onClick={() => onSelect(parent.id)} className="-mt-1 inline-flex w-fit items-center gap-1.5 text-[13px] text-muted transition hover:text-fg">
          <CornerLeftUp className="h-3.5 w-3.5" /> from <span className="font-medium text-fg/90">{parent.wiki?.title ?? parent.title}</span>
        </button>
      )}

      {node.summary && <p className="text-[15px] leading-[1.7] text-fg/85">{node.summary}</p>}

      {wiki?.extract && wiki.extract !== node.summary && (
        <div className="-mt-1">
          <button type="button" onClick={() => setShowExtract((s) => !s)} aria-expanded={showExtract} className="inline-flex items-center gap-1 text-[13px] font-medium text-purple-light transition hover:text-fg">
            {showExtract ? "Hide" : "Read"} the Wikipedia introduction
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showExtract && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {showExtract && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="mt-2.5 rounded-xl border border-line bg-surface p-3.5 text-[13.5px] leading-relaxed text-muted">{wiki.extract}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {!node.expanded ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onExpand(node.id)}
            disabled={node.loading || expanding}
            className="bg-brand inline-flex h-11 items-center justify-center gap-2 rounded-xl text-[14.5px] font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
          >
            {node.loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" /> Finding connections…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Expand this concept
              </>
            )}
          </motion.button>
        ) : (
          children.length > 0 && (
            <button type="button" onClick={() => onToggleCollapse(node.id)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-[14px] font-medium text-fg transition hover:bg-surface-hover">
              {collapsed ? (
                <>
                  <ChevronsUpDown className="h-4 w-4" /> Unfold branch · {hidden} hidden
                </>
              ) : (
                <>
                  <ChevronsDownUp className="h-4 w-4" /> Fold this branch
                </>
              )}
            </button>
          )
        )}
        {node.depth > 0 && (
          <button type="button" onClick={() => onNewMap(title)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl text-[13.5px] font-medium text-muted transition hover:bg-surface-hover hover:text-fg">
            <Compass className="h-4 w-4" /> Start a new map from {title.length > 24 ? "here" : title}
          </button>
        )}
      </div>

      {children.length > 0 && !collapsed && (
        <section>
          <h3 className="eyebrow mb-1.5 flex items-center justify-between px-0.5">
            Added by expanding <span className="tabular-nums">{children.length}</span>
          </h3>
          <ul className="-mx-2.5">
            {children.map((c) => (
              <Row key={c.id} node={c} label={store.links.find((l) => (l.source.id === node.id && l.target.id === c.id) || (l.target.id === node.id && l.source.id === c.id))?.label} onSelect={onSelect} />
            ))}
          </ul>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <h3 className="eyebrow mb-1.5 flex items-center justify-between px-0.5">
            {children.length ? "Also connected" : "Connections"} <span className="tabular-nums">{others.length}</span>
          </h3>
          <ul className="-mx-2.5">
            {others.map(({ node: o, label, outgoing }) => (
              <Row key={o.id} node={o} label={label ? (outgoing ? label : `← ${label}`) : undefined} onSelect={onSelect} />
            ))}
          </ul>
        </section>
      )}

      {showShortcuts && (
        <p className="border-t border-line pt-4 text-[12px] text-faint">
          <kbd className="rounded-md border border-line px-1.5 py-0.5">E</kbd> expand · <kbd className="rounded-md border border-line px-1.5 py-0.5">F</kbd> fit · <kbd className="rounded-md border border-line px-1.5 py-0.5">Esc</kbd> close
        </p>
      )}
    </div>
  );
}

export function DetailPanel(props: Props) {
  const { node, mode, width, sheetFull, onSheetFull, onClose } = props;
  const dragControls = useDragControls();

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) {
      if (sheetFull) onSheetFull(false);
      else onClose();
    } else if (info.offset.y < -50 || info.velocity.y < -500) onSheetFull(true);
  };

  return (
    <AnimatePresence>
      {node &&
        (mode === "sheet" ? (
          <motion.aside
            key="sheet"
            aria-label={`${node.title} details`}
            initial={{ y: "100%" }}
            animate={{ y: 0, height: sheetFull ? "86dvh" : "47dvh" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 340 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.06, bottom: 0.5 }}
            onDragEnd={onDragEnd}
            className="glass fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-[28px] shadow-float"
          >
            <div onPointerDown={(e) => dragControls.start(e)} onClick={() => onSheetFull(!sheetFull)} className="flex shrink-0 cursor-grab touch-none items-center justify-between px-3 pt-2.5 active:cursor-grabbing">
              <span className="w-10" />
              <span className="h-1.5 w-11 rounded-full bg-white/20" aria-hidden />
              <button type="button" aria-label="Close" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => (e.stopPropagation(), onClose())} className="grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-surface-hover">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="safe-bottom thin-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="mx-auto max-w-2xl px-5 pb-8 pt-1 sm:px-8">
                <Body key={node.id} {...props} node={node} wide={typeof window !== "undefined" && window.innerWidth >= 640} />
              </div>
            </div>
          </motion.aside>
        ) : (
          <motion.aside
            key="side"
            aria-label={`${node.title} details`}
            initial={{ x: -width - 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -width - 24, opacity: 0 }}
            transition={{ type: "spring", damping: 34, stiffness: 340 }}
            style={{ width }}
            className="glass absolute bottom-3 left-3 top-[76px] z-30 flex flex-col rounded-[24px] shadow-float"
          >
            <button type="button" aria-label="Close" onClick={onClose} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-xl bg-black/30 text-white/80 backdrop-blur-md transition hover:bg-black/50 hover:text-white">
              <X className="h-4 w-4" />
            </button>
            <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
              <AnimatePresence mode="wait">
                <motion.div key={node.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                  <Body {...props} node={node} wide={false} />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.aside>
        ))}
    </AnimatePresence>
  );
}
