import { CATEGORIES, CATEGORY_KEYS, type Category } from "@/lib/categories";
import { drawGraph, nodeImage, nodeRadius, readTheme, rgba, type Theme } from "./render";
import type { GraphStore, SimLink, SimNode } from "./store";

/**
 * Designed share images (social cards) and the PDF export.
 * Every format uses the Throvic look: deep blue-black, purple/teal light, grid, the graph itself.
 */

export type ShareFormat = "landscape" | "square" | "story" | "map";

export const FORMATS: Record<ShareFormat, { label: string; hint: string; w: number; h: number }> = {
  landscape: { label: "Landscape", hint: "X, LinkedIn, Facebook, WhatsApp", w: 1200, h: 630 },
  square: { label: "Square", hint: "Instagram & LinkedIn posts", w: 1080, h: 1080 },
  story: { label: "Story", hint: "Instagram & WhatsApp status", w: 1080, h: 1920 },
  map: { label: "Full map", hint: "Whole graph, high resolution", w: 0, h: 0 },
};

const SITE = "throvic.pages.dev";

/* ---------- helpers ---------- */

/** Wait for fonts and the main topic's photo so the first render is complete. */
async function prepare(store: GraphStore) {
  await document.fonts?.ready;
  const root = store.rootId ? store.nodeMap.get(store.rootId) : null;
  if (root?.wiki?.thumb) {
    await new Promise<void>((resolve) => {
      if (nodeImage(root.wiki!.thumb, resolve)) resolve();
      setTimeout(resolve, 2500);
    });
  }
}

function bounds(nodes: SimNode[]) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const n of nodes) {
    if (n.x == null) continue;
    const half = Math.max(nodeRadius(n) + 24, Math.min(n.title.length, 28) * 3.6);
    x0 = Math.min(x0, n.x - half);
    x1 = Math.max(x1, n.x + half);
    y0 = Math.min(y0, n.y! - nodeRadius(n) - 20);
    y1 = Math.max(y1, n.y! + nodeRadius(n) + 30);
  }
  return { x0, y0, x1, y1 };
}

/** Draws the graph into a transparent canvas of the given size (CSS pixels × scale). */
function graphLayer(store: GraphStore, theme: Theme, w: number, h: number, scale: number, maxZoom = 1.6) {
  const nodes = store.visibleNodes.filter((n) => n.x != null);
  const links: SimLink[] = store.visibleLinks;
  const c = document.createElement("canvas");
  c.width = Math.round(w * scale);
  c.height = Math.round(h * scale);
  const ctx = c.getContext("2d")!;
  const b = bounds(nodes);
  const k = Math.min(maxZoom, w / (b.x1 - b.x0), h / (b.y1 - b.y0));
  const view = { k, x: w / 2 - ((b.x0 + b.x1) / 2) * k, y: h / 2 - ((b.y0 + b.y1) / 2) * k, width: w, height: h, dpr: scale };
  drawGraph(ctx, nodes, links, view, theme, {
    selectedId: null,
    hoverId: null,
    focus: null,
    now: Number.MAX_SAFE_INTEGER,
    grid: false,
    background: false,
    images: true,
    labels: nodes.length <= 45 ? "all" : "auto",
    clusters: true,
  });
  return c;
}

function backdrop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#0d0d14";
  ctx.fillRect(0, 0, w, h);
  const glow = (x: number, y: number, r: number, color: string, a: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(color, a));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };
  glow(w * 0.08, h * 0.05, Math.max(w, h) * 0.6, "#7f77dd", 0.28);
  glow(w * 0.95, h * 0.95, Math.max(w, h) * 0.55, "#5dcaa5", 0.2);
  // grid
  ctx.strokeStyle = "rgba(255,255,255,0.035)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 44) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
  }
  for (let y = 0; y <= h; y += 44) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
  }
  ctx.stroke();
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

/** The Throvic mark (the T made of a tiny graph) at x, y with the given size. */
function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size / 32;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const g = ctx.createLinearGradient(0, 0, 32, 32);
  g.addColorStop(0, "#8a82e6");
  g.addColorStop(1, "#4fbf9a");
  ctx.fillStyle = g;
  roundRect(ctx, 0, 0, 32, 32, 9);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1.7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(8.5, 10.5);
  ctx.lineTo(23.5, 10.5);
  ctx.moveTo(16, 10.5);
  ctx.lineTo(16, 22.5);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  for (const [cx, cy, r] of [[8.5, 10.5, 2.3], [23.5, 10.5, 2.3], [16, 10.5, 3.1], [16, 23, 2.7]]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawWordmark(ctx: CanvasRenderingContext2D, theme: Theme, x: number, y: number, size: number) {
  drawMark(ctx, x, y, size);
  ctx.font = `700 ${size * 0.62}px ${theme.display}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = "#e8e6f0";
  const tx = x + size + size * 0.32;
  ctx.fillText("Thro", tx, y + size / 2 + 1);
  const w = ctx.measureText("Thro").width;
  const g = ctx.createLinearGradient(tx + w, 0, tx + w + size * 1.2, 0);
  g.addColorStop(0, "#8f87e8");
  g.addColorStop(1, "#5dcaa5");
  ctx.fillStyle = g;
  ctx.fillText("vic", tx + w, y + size / 2 + 1);
}

/** Breaks text into at most `maxLines` lines that fit `width`. */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > width && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S*$/, "")}…`;
    return kept;
  }
  return lines;
}

function presentCategories(store: GraphStore) {
  const counts = new Map<Category, number>();
  for (const n of store.visibleNodes) counts.set(n.category, (counts.get(n.category) ?? 0) + 1);
  return CATEGORY_KEYS.filter((c) => counts.has(c)).sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));
}

function drawChips(ctx: CanvasRenderingContext2D, theme: Theme, cats: Category[], x: number, y: number, maxW: number, size = 15) {
  ctx.font = `500 ${size}px ${theme.font}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  let cx = x;
  let cy = y;
  const h = size * 2;
  for (const c of cats.slice(0, 6)) {
    const label = CATEGORIES[c].label;
    const w = ctx.measureText(label).width + size * 2.4;
    if (cx + w > x + maxW) {
      cx = x;
      cy += h + 8;
    }
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    roundRect(ctx, cx, cy, w, h, h / 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.09)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = CATEGORIES[c].color;
    ctx.beginPath();
    ctx.arc(cx + size * 0.95, cy + h / 2, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(232,230,240,0.8)";
    ctx.fillText(label, cx + size * 1.6, cy + h / 2 + 0.5);
    cx += w + 8;
  }
  return cy + h;
}

function stats(store: GraphStore) {
  const verified = store.nodes.filter((n) => n.wiki).length;
  const levels = store.maxDepth + 1;
  return `${store.size} concepts · ${levels} level${levels === 1 ? "" : "s"} · ${verified} verified on Wikipedia`;
}

function graphPanel(ctx: CanvasRenderingContext2D, layer: HTMLCanvasElement, x: number, y: number, w: number, h: number, scale: number) {
  ctx.save();
  ctx.fillStyle = "rgba(19,19,28,0.6)";
  roundRect(ctx, x, y, w, h, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  roundRect(ctx, x, y, w, h, 28);
  ctx.clip();
  ctx.drawImage(layer, x, y, layer.width / scale, layer.height / scale);
  ctx.restore();
}

/* ---------- social cards ---------- */

export async function renderShareImage(store: GraphStore, el: Element, format: ShareFormat): Promise<HTMLCanvasElement> {
  await prepare(store);
  const theme = readTheme(el);
  const title = store.rootTitle || "Knowledge map";
  const url = `${SITE}/explore?q=${encodeURIComponent(title).replace(/%20/g, "+")}`;
  const cats = presentCategories(store);

  if (format === "map") {
    const nodes = store.visibleNodes;
    const b = bounds(nodes);
    const scale = 2;
    const pad = 80;
    const w = Math.min(3000, Math.max(1200, b.x1 - b.x0 + pad * 2));
    const h = Math.min(3000, Math.max(900, b.y1 - b.y0 + pad * 2 + 120));
    const c = document.createElement("canvas");
    c.width = w * scale;
    c.height = h * scale;
    const ctx = c.getContext("2d")!;
    ctx.scale(scale, scale);
    backdrop(ctx, w, h);
    drawWordmark(ctx, theme, 48, 40, 40);
    ctx.font = `700 34px ${theme.display}`;
    ctx.fillStyle = "#e8e6f0";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(title, w - 48, 60);
    const layer = graphLayer(store, theme, w - 64, h - 180, scale, 1.4);
    ctx.drawImage(layer, 32, 120, w - 64, h - 180);
    ctx.font = `500 18px ${theme.font}`;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(232,230,240,0.55)";
    ctx.fillText(`${stats(store)}   ·   ${url}`, 48, h - 36);
    return c;
  }

  const { w, h } = FORMATS[format];
  const scale = 2;
  const c = document.createElement("canvas");
  c.width = w * scale;
  c.height = h * scale;
  const ctx = c.getContext("2d")!;
  ctx.scale(scale, scale);
  backdrop(ctx, w, h);

  if (format === "landscape") {
    drawWordmark(ctx, theme, 56, 52, 40);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = `600 15px ${theme.font}`;
    ctx.fillStyle = "#afa9ec";
    ctx.fillText("KNOWLEDGE MAP", 58, 168);
    ctx.font = `700 54px ${theme.display}`;
    ctx.fillStyle = "#ffffff";
    const lines = wrap(ctx, title, 430, 3);
    lines.forEach((l, i) => ctx.fillText(l, 56, 228 + i * 60));
    let y = 228 + (lines.length - 1) * 60 + 44;
    ctx.font = `400 18px ${theme.font}`;
    ctx.fillStyle = "rgba(232,230,240,0.62)";
    for (const l of wrap(ctx, stats(store), 430, 2)) {
      ctx.fillText(l, 56, y);
      y += 26;
    }
    drawChips(ctx, theme, cats, 56, y + 12, 440, 14);
    ctx.font = `500 16px ${theme.font}`;
    ctx.fillStyle = "rgba(232,230,240,0.5)";
    ctx.fillText(url, 56, h - 50);
    graphPanel(ctx, graphLayer(store, theme, 620, 550, scale), 540, 40, 620, 550, scale);
  } else if (format === "square") {
    drawWordmark(ctx, theme, 64, 60, 44);
    ctx.font = `500 17px ${theme.font}`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(232,230,240,0.5)";
    ctx.fillText(SITE, w - 64, 82);
    graphPanel(ctx, graphLayer(store, theme, w - 128, 600, scale), 64, 140, w - 128, 600, scale);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = `600 16px ${theme.font}`;
    ctx.fillStyle = "#afa9ec";
    ctx.fillText("KNOWLEDGE MAP", 66, 812);
    ctx.font = `700 60px ${theme.display}`;
    ctx.fillStyle = "#ffffff";
    const lines = wrap(ctx, title, w - 128, 2);
    lines.forEach((l, i) => ctx.fillText(l, 64, 878 + i * 64));
    const y = 878 + (lines.length - 1) * 64 + 40;
    ctx.font = `400 19px ${theme.font}`;
    ctx.fillStyle = "rgba(232,230,240,0.62)";
    ctx.fillText(stats(store), 64, y);
    drawChips(ctx, theme, cats, 64, y + 24, w - 128, 14);
  } else {
    drawWordmark(ctx, theme, 72, 110, 52);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = `600 22px ${theme.font}`;
    ctx.fillStyle = "#afa9ec";
    ctx.fillText("KNOWLEDGE MAP", 74, 300);
    ctx.font = `700 92px ${theme.display}`;
    ctx.fillStyle = "#ffffff";
    const lines = wrap(ctx, title, w - 144, 3);
    lines.forEach((l, i) => ctx.fillText(l, 72, 400 + i * 98));
    const y = 400 + (lines.length - 1) * 98 + 58;
    ctx.font = `400 26px ${theme.font}`;
    ctx.fillStyle = "rgba(232,230,240,0.62)";
    for (const [i, l] of wrap(ctx, stats(store), w - 144, 2).entries()) ctx.fillText(l, 72, y + i * 36);
    const gy = Math.max(620, y + 110);
    const gh = 1500 - gy + 120;
    graphPanel(ctx, graphLayer(store, theme, w - 144, gh, scale, 1.9), 72, gy, w - 144, gh, scale);
    drawChips(ctx, theme, cats, 72, gy + gh + 40, w - 144, 20);
    // call to action
    ctx.font = `600 28px ${theme.font}`;
    const cta = "Explore it live  →";
    const cw = ctx.measureText(cta).width + 72;
    const g = ctx.createLinearGradient(72, 0, 72 + cw, 0);
    g.addColorStop(0, "#7f77dd");
    g.addColorStop(1, "#5dcaa5");
    ctx.fillStyle = g;
    roundRect(ctx, 72, h - 190, cw, 76, 22);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.fillText(cta, 108, h - 151);
    ctx.font = `500 24px ${theme.font}`;
    ctx.fillStyle = "rgba(232,230,240,0.5)";
    ctx.fillText(SITE, 72 + cw + 28, h - 151);
  }
  return c;
}

export function canvasToBlob(c: HTMLCanvasElement, type = "image/png", quality?: number) {
  return new Promise<Blob | null>((resolve) => {
    try {
      c.toBlob((b) => resolve(b), type, quality);
    } catch {
      resolve(null); // an image without CORS headers tainted the canvas
    }
  });
}

/* ---------- PDF: cover image + a study sheet of every concept ---------- */

export async function buildPdf(store: GraphStore, el: Element): Promise<Blob> {
  const [{ jsPDF }, cover] = await Promise.all([import("jspdf"), renderShareImage(store, el, "landscape")]);
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: [1200, 630], compress: true });
  pdf.addImage(cover.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 1200, 630);
  const title = store.rootTitle || "Knowledge map";
  pdf.setProperties({ title: `${title} — knowledge map`, creator: "Throvic", subject: "Knowledge map exported from throvic.pages.dev" });

  // Study sheet pages (A4 portrait, dark, on-brand).
  const W = 595.28;
  const H = 841.89;
  const M = 48;
  const page = () => {
    pdf.addPage([W, H], "portrait");
    pdf.setFillColor(13, 13, 20);
    pdf.rect(0, 0, W, H, "F");
  };
  const hex = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)] as const;
  page();
  let y = M + 8;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(175, 169, 236);
  pdf.text("STUDY SHEET", M, y);
  y += 26;
  pdf.setFontSize(26);
  pdf.setTextColor(255, 255, 255);
  pdf.text(pdf.splitTextToSize(title, W - M * 2), M, y);
  y += 22;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(160, 158, 175);
  pdf.text(stats(store), M, y);
  y += 26;

  // Concepts in reading order: main topic, then each level.
  const ordered = [...store.nodes].sort((a, b) => a.depth - b.depth);
  let level = -1;
  for (const n of ordered) {
    const summary = n.summary || n.wiki?.extract || "";
    const lines = pdf.splitTextToSize(summary, W - M * 2 - 16);
    const need = 34 + lines.length * 13 + (n.depth !== level ? 30 : 0);
    if (y + need > H - M) {
      page();
      y = M;
    }
    if (n.depth !== level) {
      level = n.depth;
      pdf.setDrawColor(60, 60, 78);
      pdf.line(M, y, W - M, y);
      y += 18;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(120, 118, 140);
      pdf.text(level === 0 ? "MAIN TOPIC" : `LEVEL ${level}`, M, y);
      y += 16;
    }
    const [r, g, b] = hex(CATEGORIES[n.category]?.color ?? "#afa9ec");
    pdf.setFillColor(r, g, b);
    pdf.circle(M + 4, y - 3.5, 3.5, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12.5);
    pdf.setTextColor(240, 238, 248);
    const name = n.wiki?.title ?? n.title;
    pdf.text(name, M + 16, y);
    const nameW = pdf.getTextWidth(name); // measured in the bold 12.5pt font it was drawn with
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(r, g, b);
    const cat = CATEGORIES[n.category]?.label ?? "Other";
    pdf.text(cat, M + 16 + nameW + 8, y);
    if (n.wiki?.url) {
      pdf.setTextColor(140, 180, 230);
      pdf.textWithLink("Wikipedia", W - M - pdf.getTextWidth("Wikipedia"), y, { url: n.wiki.url });
    }
    y += 15;
    pdf.setFontSize(10);
    pdf.setTextColor(190, 188, 205);
    pdf.text(lines, M + 16, y);
    y += lines.length * 13 + 14;
  }
  pdf.setFontSize(9);
  pdf.setTextColor(110, 108, 130);
  const link = `https://${SITE}/explore?q=${encodeURIComponent(title)}`;
  pdf.textWithLink(`Explore this map live: ${SITE}`, M, H - 28, { url: link });
  return pdf.output("blob");
}
