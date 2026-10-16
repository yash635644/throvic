"use client";

import { useEffect, useId, useImperativeHandle, useRef, useState, useSyncExternalStore, type KeyboardEvent, type Ref } from "react";
import { CATEGORIES } from "@/lib/categories";
import { GraphEngine, type EngineOptions, type Insets, type Layout } from "./engine";
import type { GraphStore } from "./store";

export interface GraphCanvasHandle {
  fit: (animate?: boolean) => void;
  /** Fits once the physics has calmed down (new graphs keep spreading out for a moment). */
  fitWhenSettled: () => void;
  /** Frames just these concepts (e.g. a branch that was just expanded). */
  fitTo: (ids: string[]) => void;
  focusNode: (id: string) => void;
  zoomBy: (factor: number) => void;
  exportPng: (title: string) => Promise<Blob | null>;
}

interface Props extends EngineOptions {
  store: GraphStore;
  layout?: Layout;
  frozen?: boolean;
  insets?: Insets;
  className?: string;
  ariaLabel?: string;
  ref?: Ref<GraphCanvasHandle>;
}

export function GraphCanvas({ store, layout = "force", frozen = false, insets, className, ariaLabel, ref, ...opts }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GraphEngine | null>(null);
  const optsRef = useRef(opts);
  const version = useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
  const kbId = useRef<string | null>(null);
  const [said, setSaid] = useState("");
  const hintId = useId();
  const keyboard = opts.interactive !== false;

  useEffect(() => {
    optsRef.current = opts;
  });

  useEffect(() => {
    const engine = new GraphEngine(canvasRef.current!, store, {
      interactive: opts.interactive,
      grid: opts.grid,
      background: opts.background,
      labels: opts.labels,
      maxFitScale: opts.maxFitScale,
      onNodeClick: (id) => optsRef.current.onNodeClick?.(id),
      onNodeDoubleClick: (id) => optsRef.current.onNodeDoubleClick?.(id),
      onBackgroundClick: () => optsRef.current.onBackgroundClick?.(),
    });
    engineRef.current = engine;
    // A canvas created for a map that is already loaded (e.g. remounted) frames it once it settles.
    if (store.size) engine.fitWhenSettled();
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // The engine lives for the component's lifetime; option changes are read through optsRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  useEffect(() => engineRef.current?.sync(), [version]);
  useEffect(() => engineRef.current?.setLayout(layout), [layout]);
  useEffect(() => engineRef.current?.setFrozen(frozen), [frozen]);
  useEffect(() => {
    // Re-read fonts once the web fonts have loaded, so canvas labels use them.
    let alive = true;
    document.fonts?.ready.then(() => alive && engineRef.current?.refreshTheme());
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (engineRef.current && insets) engineRef.current.insets = insets;
  }, [insets]);

  useImperativeHandle(
    ref,
    () => ({
      fit: (animate = true) => engineRef.current?.fit(animate),
      fitWhenSettled: () => engineRef.current?.fitWhenSettled(),
      fitTo: (ids) => engineRef.current?.fit(true, 1.5, new Set(ids)),
      focusNode: (id) => engineRef.current?.focusNode(id),
      zoomBy: (f) => engineRef.current?.zoomBy(f),
      exportPng: (title) => engineRef.current?.exportPng(title) ?? Promise.resolve(null),
    }),
    [],
  );

  /* ---------- keyboard + screen readers ---------- */

  const describe = (id: string) => {
    const n = store.nodeMap.get(id);
    if (!n) return "";
    const links = store.neighbourIds(id).size - 1;
    const cat = CATEGORIES[n.category]?.label ?? n.category;
    const role = n.depth === 0 ? "main topic, " : "";
    const folded = store.collapsed.has(id) ? `, branch folded (${store.hiddenCount(id)} hidden)` : "";
    return `${n.wiki?.title ?? n.title}, ${role}${cat}, ${links} connection${links === 1 ? "" : "s"}${folded}`;
  };

  const moveTo = (id: string | null) => {
    if (!id) return;
    kbId.current = id;
    store.setHover(id); // the hover ring doubles as the keyboard focus ring
    engineRef.current?.ensureVisible(id);
    setSaid(describe(id));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey || !store.size) return;
    const cur = kbId.current && store.visibleNodes.some((n) => n.id === kbId.current) ? kbId.current : null;
    const start = cur ?? store.selectedId ?? store.rootId;
    const dirs: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (dirs[e.key]) {
      e.preventDefault();
      if (!cur) return moveTo(start);
      const next = engineRef.current?.nodeInDirection(cur, ...dirs[e.key]);
      if (next) moveTo(next);
      else setSaid(`Nothing further that way. ${describe(cur)}`);
    } else if (e.key === "Home") {
      e.preventDefault();
      moveTo(store.rootId);
    } else if ((e.key === "Enter" || e.key === " ") && cur && cur !== store.selectedId) {
      // First Enter opens the concept; once it is open, Enter falls through to "expand".
      e.preventDefault();
      e.stopPropagation();
      optsRef.current.onNodeClick?.(cur);
    } else if (e.key === "Escape" && cur) {
      kbId.current = null;
      store.setHover(null);
    }
  };

  const onBlur = () => {
    if (kbId.current && store.hoverId === kbId.current) store.setHover(null);
    kbId.current = null;
  };

  return (
    <div
      className={`${className ?? "absolute inset-0"} ${keyboard ? "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple/50" : ""}`}
      {...(keyboard && {
        tabIndex: 0,
        role: "application",
        "aria-roledescription": "knowledge map",
        "aria-label": ariaLabel ?? "Knowledge graph",
        "aria-describedby": hintId,
        onKeyDown,
        onBlur,
      })}
    >
      <canvas ref={canvasRef} aria-hidden={keyboard || undefined} role={keyboard ? undefined : "img"} aria-label={keyboard ? undefined : ariaLabel ?? "Knowledge graph"} className={`block select-none ${opts.interactive === false ? "touch-pan-y" : "touch-none"}`} />
      {keyboard && (
        <>
          <p id={hintId} className="sr-only">
            Arrow keys move between concepts, Enter opens one and Enter again expands it, Home returns to the main topic, Escape clears. Press O for a text outline of the whole map.
          </p>
          <p className="sr-only" aria-live="polite" aria-atomic>
            {said}
          </p>
        </>
      )}
    </div>
  );
}
