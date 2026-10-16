import { CATEGORIES, type Category } from "@/lib/categories";

/**
 * Canvas drawing for the knowledge graph (explorer, landing-page demo, share images).
 * Visual language: glowing cores in the Throvic palette, links that blend between the colours of
 * the two concepts they join, soft halos around expanded branches, light flowing along focus links.
 */

export interface DrawNode {
  id: string;
  title: string;
  category: Category;
  x?: number;
  y?: number;
  depth: number;
  degree: number;
  born: number;
  loading: boolean;
  expanded: boolean;
  parent?: string;
  wiki?: { thumb?: string } | null;
}
export interface DrawLink {
  source: DrawNode;
  target: DrawNode;
  label: string;
  born: number;
}

export interface Theme {
  bg: string;
  grid: string;
  text: string;
  halo: string;
  link: string;
  ring: string;
  accent: string;
  panel: string;
  font: string;
  display: string;
}

export interface View {
  k: number;
  x: number;
  y: number;
  width: number;
  height: number;
  dpr: number;
}

export interface DrawOptions {
  selectedId: string | null;
  hoverId: string | null;
  /** Ids kept bright (hovered/selected node and its neighbours); everything else is dimmed. */
  focus: Set<string> | null;
  now: number;
  grid: boolean;
  background?: boolean;
  images: boolean;
  labels: "auto" | "all" | "none";
  /** 0..1 hover growth per node id (eased by the engine). */
  hoverT?: Map<string, number>;
  /** When the current focus started (drives the ripple and flowing light). */
  focusSince?: number;
  /** Collapsed concept id → number of hidden concepts (drawn as a "+N" badge). */
  collapsed?: Map<string, number>;
  /** Draw soft halos around expanded branches. */
  clusters?: boolean;
}

export const colorOf = (c: Category) => CATEGORIES[c]?.color ?? CATEGORIES.other.color;

export function nodeRadius(n: Pick<DrawNode, "depth" | "degree">) {
  const base = n.depth === 0 ? 24 : n.depth === 1 ? 12.5 : n.depth === 2 ? 10 : 8.5;
  return Math.min(base + Math.max(0, n.degree - 1) * 0.8, base + 6);
}

const easeOutBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const SPAWN_MS = 620;
const LINK_GROW_MS = 480;
export const RIPPLE_MS = 800;
export const FLOW_MS = 7000;

export function readTheme(el: Element): Theme {
  const s = getComputedStyle(el);
  const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  const display = v("--font-manrope", "");
  return {
    bg: v("--canvas-bg", "#0d0d14"),
    grid: v("--canvas-grid", "rgba(255,255,255,0.035)"),
    text: v("--canvas-text", "#e8e6f0"),
    halo: v("--canvas-halo", "rgba(13,13,20,0.9)"),
    link: v("--canvas-link", "rgba(175,169,236,0.18)"),
    ring: v("--canvas-ring", "#0d0d14"),
    accent: v("--canvas-accent", "#afa9ec"),
    panel: v("--canvas-panel", "#13131c"),
    font: s.fontFamily || "Inter, system-ui, sans-serif",
    display: display ? `${display}, ${s.fontFamily}` : s.fontFamily || "system-ui, sans-serif",
  };
}

export function rgba(hex: string, a: number) {
  if (!hex.startsWith("#") || hex.length !== 7) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/* ---------- Images (Wikipedia thumbnails in large nodes) ---------- */

const images = new Map<string, { img: HTMLImageElement; ready: boolean }>();
export function nodeImage(url: string | undefined, onReady: () => void) {
  if (!url) return null;
  let entry = images.get(url);
  if (!entry) {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Wikimedia allows it; keeps PNG export possible
    img.decoding = "async";
    entry = { img, ready: false };
    const e = entry;
    img.onload = () => {
      e.ready = true;
      onReady();
    };
    img.src = url;
    images.set(url, entry);
  }
  return entry.ready ? entry.img : null;
}

/* ---------- Grid ---------- */

let gridPattern: { key: string; pattern: CanvasPattern } | null = null;
function drawGrid(ctx: CanvasRenderingContext2D, view: View, theme: Theme) {
  let spacing = 44 * view.k;
  while (spacing < 26) spacing *= 2;
  while (spacing > 88) spacing /= 2;
  const size = Math.round(spacing * view.dpr);
  const key = `${size}|${theme.grid}`;
  if (!gridPattern || gridPattern.key !== key) {
    const tile = document.createElement("canvas");
    tile.width = tile.height = size;
    const t = tile.getContext("2d")!;
    t.strokeStyle = theme.grid;
    t.lineWidth = Math.max(1, view.dpr * 0.8);
    t.beginPath();
    t.moveTo(0, 0.5);
    t.lineTo(size, 0.5);
    t.moveTo(0.5, 0);
    t.lineTo(0.5, size);
    t.stroke();
    const pattern = ctx.createPattern(tile, "repeat");
    if (!pattern) return;
    gridPattern = { key, pattern };
  }
  gridPattern.pattern.setTransform(new DOMMatrix().translate((view.x * view.dpr) % size, (view.y * view.dpr) % size));
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = gridPattern.pattern;
  ctx.fillRect(0, 0, view.width * view.dpr, view.height * view.dpr);
  ctx.restore();
}

/* ---------- Geometry ---------- */

function curveControl(sx: number, sy: number, tx: number, ty: number) {
  const dx = tx - sx;
  const dy = ty - sy;
  return { cx: (sx + tx) / 2 - dy * 0.1, cy: (sy + ty) / 2 + dx * 0.1 };
}
function curvePoint(sx: number, sy: number, cx: number, cy: number, tx: number, ty: number, t: number) {
  const u = 1 - t;
  return { x: u * u * sx + 2 * u * t * cx + t * t * tx, y: u * u * sy + 2 * u * t * cy + t * t * ty };
}
function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.01, r), 0, Math.PI * 2);
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ---------- Main draw ---------- */

export function drawGraph(
  ctx: CanvasRenderingContext2D,
  nodes: DrawNode[],
  links: DrawLink[],
  view: View,
  theme: Theme,
  opts: DrawOptions,
  requestDraw: () => void = () => {},
) {
  const { k, dpr } = view;
  const { focus, now } = opts;
  const center = opts.hoverId || opts.selectedId;
  const sinceFocus = opts.focusSince != null ? now - opts.focusSince : Infinity;
  const manyLinks = links.length > 350;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (opts.background === false) ctx.clearRect(0, 0, view.width, view.height);
  else {
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, view.width, view.height);
  }
  if (opts.grid) drawGrid(ctx, view, theme);

  ctx.save();
  ctx.translate(view.x, view.y);
  ctx.scale(k, k);
  ctx.lineCap = "round";

  /* branch halos: each expanded concept with its visible children */
  if (opts.clusters !== false) {
    const byParent = new Map<string, DrawNode[]>();
    for (const n of nodes) if (n.parent && n.x != null) byParent.set(n.parent, [...(byParent.get(n.parent) ?? []), n]);
    for (const n of nodes) {
      const kids = byParent.get(n.id);
      if (!kids || kids.length < 2 || n.x == null || n.depth === 0) continue;
      let cx = n.x, cy = n.y!;
      for (const c of kids) {
        cx += c.x!;
        cy += c.y!;
      }
      cx /= kids.length + 1;
      cy /= kids.length + 1;
      let r = 0;
      for (const c of [n, ...kids]) r = Math.max(r, Math.hypot(c.x! - cx, c.y! - cy));
      r += 34;
      const color = colorOf(n.category);
      const appear = clamp01((now - Math.max(...kids.map((c) => c.born))) / 700);
      const dim = focus && !focus.has(n.id) ? 0.4 : 1;
      const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
      g.addColorStop(0, rgba(color, 0.07 * appear * dim));
      g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g;
      circle(ctx, cx, cy, r);
      ctx.fill();
      ctx.setLineDash([3 / k, 6 / k]);
      ctx.strokeStyle = rgba(color, 0.2 * appear * dim);
      ctx.lineWidth = 1 / k;
      circle(ctx, cx, cy, r);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  /* links: dimmed ones first, focused ones on top */
  const passes: DrawLink[][] = [[], []];
  for (const l of links) passes[center && (l.source.id === center || l.target.id === center) ? 1 : 0].push(l);
  passes.forEach((list, pass) => {
    const active = pass === 1;
    for (const l of list) {
      const s = l.source;
      const t = l.target;
      if (s.x == null || t.x == null) continue;
      const grow = easeOutCubic(clamp01((now - l.born) / LINK_GROW_MS));
      const sc = colorOf(s.category);
      const tc = colorOf(t.category);
      const deep = Math.max(s.depth, t.depth);
      ctx.globalAlpha = focus && !active ? 0.25 : 1;
      if (active) {
        const g = ctx.createLinearGradient(s.x, s.y!, t.x, t.y!);
        g.addColorStop(0, rgba(sc, 0.95));
        g.addColorStop(1, rgba(tc, 0.95));
        ctx.strokeStyle = g;
        ctx.lineWidth = 2 / k;
      } else if (manyLinks) {
        ctx.strokeStyle = theme.link;
        ctx.lineWidth = 1 / Math.sqrt(k);
      } else {
        const g = ctx.createLinearGradient(s.x, s.y!, t.x, t.y!);
        g.addColorStop(0, rgba(sc, 0.42));
        g.addColorStop(1, rgba(tc, 0.42));
        ctx.strokeStyle = g;
        ctx.lineWidth = (deep >= 3 ? 0.9 : 1.2) / Math.sqrt(k);
      }
      const { cx, cy } = curveControl(s.x, s.y!, t.x, t.y!);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y!);
      if (grow < 1) {
        const p = curvePoint(s.x, s.y!, cx, cy, t.x, t.y!, grow);
        ctx.quadraticCurveTo(s.x + (cx - s.x) * grow, s.y! + (cy - s.y!) * grow, p.x, p.y);
      } else ctx.quadraticCurveTo(cx, cy, t.x, t.y!);
      ctx.stroke();

      // light flowing along the focused concept's links for a few seconds
      if (active && grow >= 1 && sinceFocus < FLOW_MS) {
        const fade = sinceFocus > FLOW_MS - 1200 ? (FLOW_MS - sinceFocus) / 1200 : 1;
        const outward = l.source.id === center;
        for (let i = 0; i < 2; i++) {
          let u = ((now / 1500 + i * 0.5 + (l.label.length % 7) * 0.13) % 1);
          if (!outward) u = 1 - u;
          const p = curvePoint(s.x, s.y!, cx, cy, t.x, t.y!, u);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 7 / k);
          g.addColorStop(0, `rgba(255,255,255,${0.95 * fade})`);
          g.addColorStop(0.35, rgba(u < 0.5 ? sc : tc, 0.6 * fade));
          g.addColorStop(1, rgba(u < 0.5 ? sc : tc, 0));
          ctx.fillStyle = g;
          circle(ctx, p.x, p.y, 7 / k);
          ctx.fill();
        }
      }
    }
  });
  ctx.globalAlpha = 1;

  /* nodes */
  const drawn: { n: DrawNode; r: number; alpha: number }[] = [];
  for (const n of nodes) {
    if (n.x == null || n.y == null) continue;
    const spawnT = clamp01((now - n.born) / SPAWN_MS);
    const hoverT = opts.hoverT?.get(n.id) ?? 0;
    const r = nodeRadius(n) * Math.max(0.05, easeOutBack(spawnT)) * (1 + 0.16 * hoverT);
    const dim = !!focus && !focus.has(n.id);
    const alpha = (dim ? 0.3 : n.depth >= 3 ? 0.9 : 1) * Math.min(1, spawnT * 1.6);
    const color = colorOf(n.category);
    const isSel = n.id === opts.selectedId;
    drawn.push({ n, r, alpha });
    ctx.globalAlpha = alpha;

    // soft glow
    const glowR = r * (n.depth === 0 || isSel ? 3 : 2.3);
    const glow = ctx.createRadialGradient(n.x, n.y, r * 0.5, n.x, n.y, glowR);
    glow.addColorStop(0, rgba(color, n.depth === 0 || isSel ? 0.42 : 0.24 + 0.16 * hoverT));
    glow.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = glow;
    circle(ctx, n.x, n.y, glowR);
    ctx.fill();

    // selection ripple
    if (isSel && sinceFocus < RIPPLE_MS) {
      const p = sinceFocus / RIPPLE_MS;
      ctx.strokeStyle = rgba(color, 0.7 * (1 - p));
      ctx.lineWidth = 2 / k;
      circle(ctx, n.x, n.y, r + (6 + 26 * easeOutCubic(p)) / k);
      ctx.stroke();
    }

    const img = opts.images && r * k >= 16 ? nodeImage(n.wiki?.thumb, requestDraw) : null;
    if (n.depth === 0) {
      // the main topic: photo (or core) inside a purple → teal ring
      ctx.fillStyle = theme.panel;
      circle(ctx, n.x, n.y, r);
      ctx.fill();
      if (img) {
        ctx.save();
        circle(ctx, n.x, n.y, r - 3 / k);
        ctx.clip();
        const sc = Math.max((r * 2) / img.width, (r * 2) / img.height);
        ctx.drawImage(img, n.x - (img.width * sc) / 2, n.y - (img.height * sc) / 2, img.width * sc, img.height * sc);
        ctx.restore();
      } else {
        const core = ctx.createRadialGradient(n.x - r * 0.25, n.y - r * 0.25, 0, n.x, n.y, r * 0.6);
        core.addColorStop(0, "#ffffff");
        core.addColorStop(0.35, color);
        core.addColorStop(1, rgba(color, 0.85));
        ctx.fillStyle = core;
        circle(ctx, n.x, n.y, r * 0.55);
        ctx.fill();
      }
      const ring = ctx.createLinearGradient(n.x - r, n.y - r, n.x + r, n.y + r);
      ring.addColorStop(0, "#8f87e8");
      ring.addColorStop(1, "#5dcaa5");
      ctx.strokeStyle = ring;
      ctx.lineWidth = Math.max(3 / k, r * 0.13);
      circle(ctx, n.x, n.y, r - ctx.lineWidth / 2);
      ctx.stroke();
    } else if (img && r * k >= 22) {
      ctx.save();
      circle(ctx, n.x, n.y, r);
      ctx.clip();
      const sc = Math.max((r * 2) / img.width, (r * 2) / img.height);
      ctx.drawImage(img, n.x - (img.width * sc) / 2, n.y - (img.height * sc) / 2, img.width * sc, img.height * sc);
      ctx.restore();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5 / k;
      circle(ctx, n.x, n.y, r - 1.25 / k);
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      circle(ctx, n.x, n.y, r);
      ctx.fill();
      // a quiet inner highlight gives depth without looking glossy
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      circle(ctx, n.x - r * 0.18, n.y - r * 0.2, r * 0.55);
      ctx.fill();
    }

    // separation ring
    ctx.strokeStyle = theme.ring;
    ctx.lineWidth = 2 / k;
    circle(ctx, n.x, n.y, r + 1 / k);
    ctx.stroke();

    // expanded concepts wear a thin outer ring
    if (n.expanded && n.depth > 0) {
      ctx.strokeStyle = rgba(color, 0.7);
      ctx.lineWidth = 1.3 / k;
      circle(ctx, n.x, n.y, r + 4 / k);
      ctx.stroke();
    }

    if (isSel) {
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      ctx.lineWidth = 1.8 / k;
      circle(ctx, n.x, n.y, r + (n.expanded && n.depth > 0 ? 7.5 : 5) / k);
      ctx.stroke();
    } else if (hoverT > 0.05) {
      ctx.strokeStyle = rgba(color, 0.9 * hoverT);
      ctx.lineWidth = 1.5 / k;
      circle(ctx, n.x, n.y, r + 5 / k);
      ctx.stroke();
    }

    if (n.loading) {
      const a = (now / 240) % (Math.PI * 2);
      const arc = ctx.createLinearGradient(n.x - r, n.y, n.x + r, n.y);
      arc.addColorStop(0, "#8f87e8");
      arc.addColorStop(1, "#5dcaa5");
      ctx.strokeStyle = arc;
      ctx.lineWidth = 2.5 / k;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r + 9 / k, a, a + Math.PI * 1.1);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  /* screen-space overlays: badges, relation labels, node labels */
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.textAlign = "center";
  ctx.lineJoin = "round";
  const labelScale = Math.min(1.12, Math.max(0.88, k));

  // "+N" on folded branches
  if (opts.collapsed?.size) {
    ctx.font = `600 ${10.5 * labelScale}px ${theme.font}`;
    ctx.textBaseline = "middle";
    for (const { n, r } of drawn) {
      const hidden = opts.collapsed.get(n.id);
      if (!hidden) continue;
      const text = `+${hidden}`;
      const w = ctx.measureText(text).width + 10;
      const bx = n.x! * k + view.x + r * k * 0.75;
      const by = n.y! * k + view.y - r * k * 0.75;
      ctx.fillStyle = colorOf(n.category);
      roundRect(ctx, bx - w / 2, by - 8, w, 16, 8);
      ctx.fill();
      ctx.strokeStyle = theme.ring;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#0d0d14";
      ctx.fillText(text, bx, by + 0.5);
    }
  }

  if (opts.labels === "none") return;

  // relation labels on the focused links
  if (center) {
    ctx.font = `500 ${10.5 * labelScale}px ${theme.font}`;
    ctx.textBaseline = "middle";
    for (const l of links) {
      if (!l.label || (l.source.id !== center && l.target.id !== center) || l.source.x == null || l.target.x == null) continue;
      if (now - l.born < LINK_GROW_MS) continue;
      const { cx, cy } = curveControl(l.source.x, l.source.y!, l.target.x, l.target.y!);
      const m = curvePoint(l.source.x, l.source.y!, cx, cy, l.target.x, l.target.y!, 0.5);
      const sx = m.x * k + view.x;
      const sy = m.y * k + view.y;
      const w = ctx.measureText(l.label).width + 14;
      ctx.fillStyle = "rgba(19,19,28,0.92)";
      roundRect(ctx, sx - w / 2, sy - 9.5, w, 19, 9.5);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "rgba(232,230,240,0.85)";
      ctx.fillText(l.label, sx, sy + 0.5);
    }
  }

  ctx.textBaseline = "top";
  for (const { n, r, alpha } of drawn) {
    const sr = r * k;
    const important = n.depth === 0 || n.id === opts.selectedId || n.id === opts.hoverId || (focus?.has(n.id) ?? false);
    if (opts.labels === "auto" && !important && (k < 0.55 || (n.depth > 1 && k < 0.85) || (n.depth > 2 && k < 1.1))) continue;
    const sx = n.x! * k + view.x;
    const sy = n.y! * k + view.y + sr + 7;
    if (sx < -140 || sx > view.width + 140 || sy < -40 || sy > view.height + 40) continue;
    const strong = n.depth === 0 || n.id === opts.selectedId;
    const size = (n.depth === 0 ? 15 : n.depth === 1 ? 12.5 : 11.5) * labelScale;
    ctx.font = n.depth === 0 ? `700 ${size}px ${theme.display}` : `${strong ? 600 : 500} ${size}px ${theme.font}`;
    const text = truncate(n.title, n.depth === 0 ? 36 : 28);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = theme.halo;
    ctx.lineWidth = 4;
    ctx.strokeText(text, sx, sy);
    ctx.fillStyle = n.depth >= 2 && !strong ? "rgba(232,230,240,0.82)" : theme.text;
    ctx.fillText(text, sx, sy);
  }
  ctx.globalAlpha = 1;
}

/** True while something is still animating (spawns, growing links, loading spinners). */
export function isAnimating(nodes: DrawNode[], links: DrawLink[], now: number) {
  for (const n of nodes) if (n.loading || now - n.born < SPAWN_MS) return true;
  for (const l of links) if (now - l.born < LINK_GROW_MS) return true;
  return false;
}
