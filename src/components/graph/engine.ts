import { drag as d3drag } from "d3-drag";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceRadial,
  forceSimulation,
  forceX,
  forceY,
  type ForceLink,
  type Simulation,
} from "d3-force";
import { select, type Selection } from "d3-selection";
import "d3-transition";
import { zoom as d3zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import { drawGraph, FLOW_MS, isAnimating, nodeRadius, readTheme, RIPPLE_MS, type Theme } from "./render";
import type { GraphStore, SimLink, SimNode } from "./store";

export type Layout = "force" | "radial" | "tree";
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export interface EngineOptions {
  interactive?: boolean; // zoom + pan (off for the landing-page demo)
  grid?: boolean;
  /** false = transparent canvas, so the page background shows through. */
  background?: boolean;
  /** "all" always shows every label (small demo graphs). */
  labels?: "auto" | "all";
  /** Largest zoom "fit to screen" may use (small graphs in big frames can go higher). */
  maxFitScale?: number;
  onNodeClick?: (id: string) => void;
  onNodeDoubleClick?: (id: string) => void;
  onBackgroundClick?: () => void;
}

const NO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

/** Physics, zoom/pan, dragging and the draw loop for one canvas. Framework-free; GraphCanvas wraps it for React. */
export class GraphEngine {
  private ctx: CanvasRenderingContext2D;
  private sim: Simulation<SimNode, SimLink>;
  private zoom: ZoomBehavior<HTMLCanvasElement, unknown>;
  private sel: Selection<HTMLCanvasElement, unknown, null, undefined>;
  private transform: ZoomTransform = zoomIdentity;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private theme: Theme;
  private raf = 0;
  private resizeObserver: ResizeObserver;
  private lastNodes: SimNode[] | null = null;
  private lastNodeCount = 0;
  private lastLinkCount = 0;
  private layout: Layout = "force";
  private frozen = false;
  private destroyed = false;
  private pendingFit = false;
  insets: Insets = NO_INSETS;

  constructor(
    private canvas: HTMLCanvasElement,
    private store: GraphStore,
    private opts: EngineOptions = {},
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.theme = readTheme(canvas);
    this.sel = select(canvas);

    this.sim = forceSimulation<SimNode, SimLink>([])
      .force("link", forceLink<SimNode, SimLink>([]).id((d) => d.id))
      .force("charge", forceManyBody<SimNode>())
      .force("collide", forceCollide<SimNode>((d) => nodeRadius(d) + (d.depth === 0 ? 28 : 18) + Math.min(d.title.length, 26) * 1.5).strength(0.8))
      .alphaDecay(0.03)
      .velocityDecay(0.38)
      .on("tick", () => {
        if (this.pendingFit && this.sim.alpha() < 0.05) {
          this.pendingFit = false;
          this.fit();
        }
        this.requestDraw();
      });
    this.applyLayoutForces();

    this.zoom = d3zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.12, 4])
      .on("zoom", (e: { transform: ZoomTransform }) => {
        this.transform = e.transform;
        this.requestDraw();
      });

    const dragBehavior = d3drag<HTMLCanvasElement, unknown, { node: SimNode; x: number; y: number }>()
      .filter((e: PointerEvent | TouchEvent) => (opts.interactive !== false ? true : !("touches" in e)) && !(e as MouseEvent).button)
      .subject((e: { x: number; y: number }) => {
        const node = this.hit(e.x, e.y);
        if (!node) return undefined as never;
        const [x, y] = this.transform.apply([node.x!, node.y!]);
        return { node, x, y };
      })
      .on("start", (e: { active: number; subject: { node: SimNode } }) => {
        if (!e.active && !this.frozen) this.sim.alphaTarget(0.25).restart();
        e.subject.node.fx = e.subject.node.x;
        e.subject.node.fy = e.subject.node.y;
      })
      .on("drag", (e: { x: number; y: number; subject: { node: SimNode } }) => {
        e.subject.node.fx = this.transform.invertX(e.x);
        e.subject.node.fy = this.transform.invertY(e.y);
        if (this.frozen) {
          e.subject.node.x = e.subject.node.fx;
          e.subject.node.y = e.subject.node.fy;
        }
        this.requestDraw();
      })
      .on("end", (e: { active: number; subject: { node: SimNode } }) => {
        if (!e.active) this.sim.alphaTarget(0);
        // The main topic stays where it is dropped (it anchors the map); others spring back.
        if (!this.frozen && e.subject.node.depth !== 0) {
          e.subject.node.fx = null;
          e.subject.node.fy = null;
        }
      });

    this.sel.call(dragBehavior);
    if (opts.interactive !== false) this.sel.call(this.zoom).on("dblclick.zoom", null);

    canvas.addEventListener("click", this.onClick);
    canvas.addEventListener("dblclick", this.onDblClick);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerleave", this.onPointerLeave);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement || canvas);
    this.resize(true);
    this.sync();
  }

  /* ---------- geometry ---------- */

  private pointer(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top] as const;
  }

  /** Node under a screen point (generous on touch screens). */
  hit(sx: number, sy: number): SimNode | null {
    const [wx, wy] = this.transform.invert([sx, sy]);
    const slop = (matchMedia("(pointer: coarse)").matches ? 14 : 5) / this.transform.k;
    const nodes = this.store.visibleNodes;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (n.x == null || n.y == null) continue;
      const r = nodeRadius(n) + slop;
      if ((n.x - wx) ** 2 + (n.y - wy) ** 2 <= r * r) return n;
    }
    return null;
  }

  private resize(initial = false) {
    const parent = this.canvas.parentElement || this.canvas;
    const rect = parent.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (w === this.width && h === this.height && dpr === this.dpr) return;
    const dx = (w - this.width) / 2;
    const dy = (h - this.height) / 2;
    this.width = w;
    this.height = h;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    const t = initial ? zoomIdentity.translate(w / 2, h / 2) : this.transform.translate(dx / this.transform.k, dy / this.transform.k);
    this.setTransform(t);
    this.draw();
  }

  private setTransform(t: ZoomTransform) {
    if (this.opts.interactive !== false) this.sel.call(this.zoom.transform, t);
    else this.transform = t;
    this.requestDraw();
  }

  /* ---------- data + physics ---------- */

  /** Call after the store changes. Restarts physics only when nodes or links were added/removed. */
  sync() {
    const nodes = this.store.visibleNodes;
    const links = this.store.visibleLinks;
    const structural = nodes !== this.lastNodes || nodes.length !== this.lastNodeCount || links.length !== this.lastLinkCount;
    if (structural) {
      const grew = nodes.length > this.lastNodeCount || links.length > this.lastLinkCount;
      this.lastNodes = nodes;
      this.lastNodeCount = nodes.length;
      this.lastLinkCount = links.length;
      // Anchor the main topic at the centre so the whole map can't drift away from the camera.
      for (const n of nodes) if (n.depth === 0 && n.fx == null) {
        n.fx = n.x ?? 0;
        n.fy = n.y ?? 0;
      }
      this.sim.nodes(nodes);
      (this.sim.force("link") as ForceLink<SimNode, SimLink>).links(links);
      if (!this.frozen) this.sim.alpha(Math.max(this.sim.alpha(), grew ? 0.7 : 0.3)).restart();
      else {
        // Frozen: place new nodes next to their parent without running the physics.
        for (const n of nodes) if (n.fx == null && n.x != null) {
          n.fx = n.x;
          n.fy = n.y;
        }
      }
    }
    this.requestDraw();
  }

  setLayout(layout: Layout) {
    if (layout === this.layout) return;
    this.layout = layout;
    this.applyLayoutForces();
    if (!this.frozen) this.sim.alpha(0.9).restart();
  }

  private applyLayoutForces() {
    const link = this.sim.force("link") as ForceLink<SimNode, SimLink>;
    const charge = this.sim.force("charge") as ReturnType<typeof forceManyBody<SimNode>>;
    // Deeper levels sit a little closer to their parent, so branches stay compact.
    const dist = (l: SimLink) =>
      84 + nodeRadius(l.source) + nodeRadius(l.target) + Math.min(l.target.degree, 6) * 5 - Math.min(Math.max(l.source.depth, l.target.depth), 3) * 9;
    if (this.layout === "force") {
      link.distance(dist).strength(0.6);
      charge.strength((d) => -340 - d.degree * 30).distanceMax(1000);
      this.sim.force("x", forceX<SimNode>(0).strength(0.035)).force("y", forceY<SimNode>(0).strength(0.035)).force("radial", null);
    } else if (this.layout === "radial") {
      link.distance(60).strength(0.2);
      charge.strength(-220).distanceMax(600);
      this.sim
        .force("radial", forceRadial<SimNode>((d) => d.depth * 170, 0, 0).strength(0.95))
        .force("x", null)
        .force("y", null);
    } else {
      link.distance(60).strength(0.25);
      charge.strength(-260).distanceMax(500);
      this.sim
        .force("y", forceY<SimNode>((d) => d.depth * 150).strength(1))
        .force("x", forceX<SimNode>(0).strength(0.03))
        .force("radial", null);
    }
  }

  setFrozen(frozen: boolean) {
    this.frozen = frozen;
    if (frozen) {
      this.sim.stop();
      for (const n of this.store.nodes) {
        n.fx = n.x;
        n.fy = n.y;
      }
    } else {
      for (const n of this.store.nodes) {
        if (n.depth === 0) continue;
        n.fx = null;
        n.fy = null;
      }
      this.sim.alpha(0.3).restart();
    }
  }

  refreshTheme() {
    this.theme = readTheme(this.canvas);
    this.requestDraw();
  }

  /* ---------- camera ---------- */

  private visibleBox() {
    const i = this.insets;
    return { x: i.left, y: i.top, w: Math.max(80, this.width - i.left - i.right), h: Math.max(80, this.height - i.top - i.bottom) };
  }

  private tween = 0;

  private animateTo(t: ZoomTransform, ms = 650) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return this.setTransform(t);
    if (this.opts.interactive !== false) {
      this.sel.interrupt().transition().duration(ms).call(this.zoom.transform, t);
      return;
    }
    // No zoom behaviour on the demo canvas: ease the camera by hand.
    cancelAnimationFrame(this.tween);
    const from = this.transform;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const k = from.k + (t.k - from.k) * e;
      this.transform = zoomIdentity.translate(from.x + (t.x - from.x) * e, from.y + (t.y - from.y) * e).scale(k);
      this.requestDraw();
      if (p < 1 && !this.destroyed) this.tween = requestAnimationFrame(step);
    };
    this.tween = requestAnimationFrame(step);
  }

  /** Zooms so every node fits in the visible area (outside the side panel / bottom sheet). */
  fit(animate = true, maxScale = this.opts.maxFitScale ?? 1.4, only?: Set<string>) {
    const nodes = this.store.visibleNodes.filter((n) => n.x != null && (!only || only.has(n.id)));
    if (!nodes.length) return;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of nodes) {
      const r = nodeRadius(n) + 30;
      const half = Math.max(r, Math.min(n.title.length, 26) * 3.6); // room for the label
      x0 = Math.min(x0, n.x! - half);
      y0 = Math.min(y0, n.y! - r);
      x1 = Math.max(x1, n.x! + half);
      y1 = Math.max(y1, n.y! + r + 14);
    }
    const box = this.visibleBox();
    const k = Math.max(0.15, Math.min(maxScale, Math.min(box.w / (x1 - x0), box.h / (y1 - y0)) * 0.92));
    const t = zoomIdentity.translate(box.x + box.w / 2 - ((x0 + x1) / 2) * k, box.y + box.h / 2 - ((y0 + y1) / 2) * k).scale(k);
    if (animate) this.animateTo(t, 750);
    else this.setTransform(t);
  }

  fitWhenSettled() {
    if (this.frozen || this.sim.alpha() < 0.05) this.fit();
    else this.pendingFit = true;
  }

  /** Centres a node in the visible area. */
  focusNode(id: string, minScale = 0.85) {
    const n = this.store.nodeMap.get(id);
    if (!n || n.x == null) return;
    const box = this.visibleBox();
    const k = Math.max(this.transform.k, minScale);
    this.animateTo(zoomIdentity.translate(box.x + box.w / 2 - n.x * k, box.y + box.h / 2 - n.y! * k).scale(k));
  }

  /** Pans just enough to bring a node into the visible area (keyboard focus). */
  ensureVisible(id: string) {
    const n = this.store.nodeMap.get(id);
    if (!n || n.x == null) return;
    const box = this.visibleBox();
    const [sx, sy] = this.transform.apply([n.x, n.y!]);
    const m = 60;
    if (sx > box.x + m && sx < box.x + box.w - m && sy > box.y + m && sy < box.y + box.h - m) return;
    this.focusNode(id, this.transform.k);
  }

  /** Nearest visible node from `fromId` in a direction (keyboard arrows), favouring nodes straight ahead. */
  nodeInDirection(fromId: string, dx: number, dy: number): string | null {
    const from = this.store.nodeMap.get(fromId);
    if (!from || from.x == null) return null;
    let best: SimNode | null = null;
    let bestCost = Infinity;
    for (const n of this.store.visibleNodes) {
      if (n === from || n.x == null) continue;
      const vx = n.x - from.x, vy = n.y! - from.y!;
      const along = vx * dx + vy * dy;
      if (along <= 1) continue;
      const across = Math.abs(vx * dy - vy * dx);
      if (across > along * 1.8) continue; // roughly within 60° of the arrow
      const cost = along + across * 2;
      if (cost < bestCost) {
        bestCost = cost;
        best = n;
      }
    }
    return best?.id ?? null;
  }

  zoomBy(factor: number) {
    if (this.opts.interactive === false) return;
    this.sel.interrupt().transition().duration(250).call(this.zoom.scaleBy, factor);
  }

  /* ---------- drawing ---------- */

  requestDraw = () => {
    if (!this.raf && !this.destroyed) this.raf = requestAnimationFrame(this.frame);
  };

  private hoverT = new Map<string, number>();
  private tweening = false;
  private focusKey = "";
  private focusSince = -Infinity;

  private frame = () => {
    this.raf = 0;
    this.draw();
    const now = performance.now();
    const focusActive = !!(this.store.selectedId || this.store.hoverId) && now - this.focusSince < Math.max(FLOW_MS, RIPPLE_MS);
    if (this.tweening || focusActive || isAnimating(this.store.visibleNodes, this.store.visibleLinks, now)) this.requestDraw();
  };

  /** Eases each node's hover growth towards 1 (hovered) or 0. */
  private stepHover() {
    this.tweening = false;
    const hover = this.store.hoverId;
    if (hover && !this.hoverT.has(hover)) this.hoverT.set(hover, 0);
    for (const [id, v] of this.hoverT) {
      const target = id === hover ? 1 : 0;
      const next = v + (target - v) * 0.22;
      if (Math.abs(target - next) < 0.01) {
        if (target === 0) this.hoverT.delete(id);
        else this.hoverT.set(id, 1);
      } else {
        this.hoverT.set(id, next);
        this.tweening = true;
      }
    }
  }

  private focusSet() {
    if (this.store.highlight) return this.store.highlight;
    const id = this.store.hoverId || this.store.selectedId;
    return id ? this.store.neighbourIds(id) : null;
  }

  draw() {
    if (this.destroyed) return;
    const now = performance.now();
    const key = `${this.store.selectedId}|${this.store.hoverId}|${this.store.highlight?.size ?? 0}`;
    if (key !== this.focusKey) {
      this.focusKey = key;
      this.focusSince = now;
    }
    this.stepHover();
    const collapsed = new Map<string, number>();
    for (const id of this.store.collapsed) collapsed.set(id, this.store.hiddenCount(id));
    drawGraph(
      this.ctx,
      this.store.visibleNodes,
      this.store.visibleLinks,
      { k: this.transform.k, x: this.transform.x, y: this.transform.y, width: this.width, height: this.height, dpr: this.dpr },
      this.theme,
      {
        selectedId: this.store.selectedId,
        hoverId: this.store.hoverId,
        focus: this.focusSet(),
        now,
        hoverT: this.hoverT,
        focusSince: this.focusSince,
        collapsed,
        clusters: true,
        grid: this.opts.grid !== false,
        background: this.opts.background !== false,
        images: true,
        labels: this.opts.labels ?? "auto",
      },
      this.requestDraw,
    );
  }

  /** Renders the whole graph to a PNG (2× resolution, with a small credit line). */
  async exportPng(title: string): Promise<Blob | null> {
    const nodes = this.store.visibleNodes.filter((n) => n.x != null);
    if (!nodes.length) return null;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of nodes) {
      const r = nodeRadius(n) + 40;
      x0 = Math.min(x0, n.x! - r);
      y0 = Math.min(y0, n.y! - r);
      x1 = Math.max(x1, n.x! + r);
      y1 = Math.max(y1, n.y! + r + 20);
    }
    const scale = Math.min(2, 2400 / (x1 - x0), 2400 / (y1 - y0));
    const width = Math.max(800, Math.round((x1 - x0) * scale));
    const height = Math.max(600, Math.round((y1 - y0) * scale) + 60);
    const render = (images: boolean) => {
      const c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      const ctx = c.getContext("2d")!;
      const view = { k: scale, x: (width - (x0 + x1) * scale) / 2, y: (height - 60 - (y0 + y1) * scale) / 2, width, height, dpr: 1 };
      drawGraph(ctx, nodes, this.store.links, view, this.theme, { selectedId: null, hoverId: null, focus: null, now: Infinity, grid: true, images, labels: "all" });
      ctx.font = `600 22px ${this.theme.font}`;
      ctx.fillStyle = this.theme.text;
      ctx.globalAlpha = 0.75;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(`${title} — mapped with Throvic`, 32, height - 28);
      ctx.textAlign = "right";
      ctx.globalAlpha = 0.5;
      ctx.fillText("throvic.pages.dev", width - 32, height - 28);
      return new Promise<Blob | null>((resolve) => c.toBlob((b) => resolve(b), "image/png"));
    };
    try {
      return await render(true);
    } catch {
      return render(false); // an image without CORS headers "tainted" the canvas
    }
  }

  /* ---------- pointer events ---------- */

  private onClick = (e: MouseEvent) => {
    const [x, y] = this.pointer(e);
    const n = this.hit(x, y);
    if (n) this.opts.onNodeClick?.(n.id);
    else this.opts.onBackgroundClick?.();
  };

  private onDblClick = (e: MouseEvent) => {
    const [x, y] = this.pointer(e);
    const n = this.hit(x, y);
    if (n) this.opts.onNodeDoubleClick?.(n.id);
  };

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const [x, y] = this.pointer(e);
    const n = this.hit(x, y);
    this.canvas.style.cursor = n ? "pointer" : this.opts.interactive === false ? "default" : "grab";
    this.store.setHover(n?.id ?? null);
  };

  private onPointerLeave = () => this.store.setHover(null);

  destroy() {
    this.destroyed = true;
    this.sim.stop();
    if (this.raf) cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.sel.interrupt().on(".zoom", null).on(".drag", null);
    this.canvas.removeEventListener("click", this.onClick);
    this.canvas.removeEventListener("dblclick", this.onDblClick);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
  }
}
