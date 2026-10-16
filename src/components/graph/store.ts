import type { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import type { GraphLinkData, GraphNodeData, StreamEvent, WikiInfo } from "@/lib/types";

/**
 * The graph the visitor is exploring. d3-force mutates node positions in place, so this is a plain
 * mutable store; React components subscribe to its version number (useSyncExternalStore).
 */

export interface SimNode extends GraphNodeData, SimulationNodeDatum {
  depth: number;
  parent?: string;
  expanded: boolean;
  loading: boolean;
  /** performance.now() when it appeared, for the spawn animation. */
  born: number;
  degree: number;
}

export interface SimLink extends SimulationLinkDatum<SimNode> {
  source: SimNode;
  target: SimNode;
  label: string;
  born: number;
}

export class GraphStore {
  nodes: SimNode[] = [];
  links: SimLink[] = [];
  nodeMap = new Map<string, SimNode>();
  rootId: string | null = null;
  rootTitle = "";
  selectedId: string | null = null;
  hoverId: string | null = null;
  /** "Find in map" matches: everything else is dimmed. */
  highlight: Set<string> | null = null;
  /** Expanded concepts whose branch is folded away. */
  collapsed = new Set<string>();
  /** What the canvas shows: everything except the descendants of collapsed concepts. */
  visibleNodes: SimNode[] = [];
  visibleLinks: SimLink[] = [];
  /** Number of concepts each concept added when it was expanded. */
  childCount = new Map<string, number>();
  version = 0;
  private listeners = new Set<() => void>();

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getVersion = () => this.version;

  notify() {
    this.recomputeVisible();
    this.version++;
    for (const fn of this.listeners) fn();
  }

  private recomputeVisible() {
    this.childCount.clear();
    for (const n of this.nodes) if (n.parent) this.childCount.set(n.parent, (this.childCount.get(n.parent) ?? 0) + 1);
    if (!this.collapsed.size) {
      // Keep the same array objects when nothing is hidden, so physics doesn't restart needlessly.
      if (this.visibleNodes !== this.nodes) this.visibleNodes = this.nodes;
      if (this.visibleLinks !== this.links) this.visibleLinks = this.links;
      return;
    }
    const hidden = (n: SimNode) => {
      for (let p = n.parent ? this.nodeMap.get(n.parent) : undefined; p; p = p.parent ? this.nodeMap.get(p.parent) : undefined) {
        if (this.collapsed.has(p.id)) return true;
      }
      return false;
    };
    const nodes = this.nodes.filter((n) => !hidden(n));
    const ids = new Set(nodes.map((n) => n.id));
    const links = this.links.filter((l) => ids.has(l.source.id) && ids.has(l.target.id));
    const same = (a: unknown[], b: unknown[]) => a.length === b.length && a.every((v, i) => v === b[i]);
    if (!same(nodes, this.visibleNodes)) this.visibleNodes = nodes;
    if (!same(links, this.visibleLinks)) this.visibleLinks = links;
  }

  /** Folds or unfolds the branch a concept added. */
  toggleCollapse(id: string) {
    if (this.collapsed.has(id)) this.collapsed.delete(id);
    else this.collapsed.add(id);
    if (this.selectedId && !this.visibleNodes.some((n) => n.id === this.selectedId)) this.selectedId = id;
    this.notify();
  }

  /** Number of concepts hidden inside a collapsed branch (all levels). */
  hiddenCount(id: string) {
    let count = 0;
    const walk = (pid: string) => {
      for (const n of this.nodes) if (n.parent === pid) {
        count++;
        walk(n.id);
      }
    };
    walk(id);
    return count;
  }

  get size() {
    return this.nodes.length;
  }
  get maxDepth() {
    return this.nodes.reduce((m, n) => Math.max(m, n.depth), 0);
  }
  get selected() {
    return this.selectedId ? this.nodeMap.get(this.selectedId) ?? null : null;
  }

  reset() {
    this.nodes = [];
    this.links = [];
    this.nodeMap.clear();
    this.rootId = null;
    this.rootTitle = "";
    this.selectedId = null;
    this.hoverId = null;
    this.collapsed.clear();
    this.notify();
  }

  /** Applies one event from the graph API stream. Returns true when the graph's shape changed. */
  apply(e: StreamEvent, anchorId?: string): boolean {
    switch (e.type) {
      case "meta":
        if (!anchorId) {
          this.rootId = e.rootId;
          this.rootTitle = e.root;
        }
        return false;
      case "node":
        return this.addNode(e.node, e.parent ?? anchorId);
      case "link":
        return this.addLink(e.link);
      case "enrich": {
        const n = this.nodeMap.get(e.id);
        if (!n) return false;
        n.wiki = e.wiki;
        if (e.summary) n.summary = e.summary;
        this.notify();
        return false;
      }
      case "merge":
        return this.merge(e.from, e.into);
      default:
        return false;
    }
  }

  addNode(data: GraphNodeData, parentId?: string): boolean {
    if (this.nodeMap.has(data.id)) return false;
    const parent = parentId ? this.nodeMap.get(parentId) : undefined;
    const isRoot = !this.nodes.length;
    // Fan new concepts outward, away from where the parent's branch came from, so repeated
    // expansions grow like branches instead of piling up in the middle.
    const siblings = parent ? this.nodes.filter((n) => n.parent === parent.id).length : 0;
    const grand = parent?.parent ? this.nodeMap.get(parent.parent) : undefined;
    let angle: number;
    if (!parent) angle = Math.random() * Math.PI * 2;
    else if (!grand || grand.x == null || parent.x == null) angle = siblings * 2.39996; // golden angle around the root
    else {
      const away = Math.atan2(parent.y! - grand.y!, parent.x - grand.x);
      angle = away + (siblings % 2 ? 1 : -1) * Math.ceil(siblings / 2) * 0.42;
    }
    const dist = parent ? 60 + (parent.depth === 0 ? 30 : 0) : 0;
    const node: SimNode = {
      ...data,
      depth: parent ? parent.depth + 1 : isRoot ? 0 : 1,
      parent: parent?.id,
      expanded: false,
      loading: false,
      born: performance.now(),
      degree: 0,
      x: (parent?.x ?? 0) + Math.cos(angle) * dist,
      y: (parent?.y ?? 0) + Math.sin(angle) * dist,
    };
    this.nodes.push(node);
    this.nodeMap.set(node.id, node);
    if (isRoot && !this.rootId) this.rootId = node.id;
    this.notify();
    return true;
  }

  addLink(data: GraphLinkData): boolean {
    const source = this.nodeMap.get(data.source);
    const target = this.nodeMap.get(data.target);
    if (!source || !target || source === target) return false;
    if (this.links.some((l) => (l.source === source && l.target === target) || (l.source === target && l.target === source))) return false;
    this.links.push({ source, target, label: data.label, born: performance.now() });
    source.degree++;
    target.degree++;
    this.notify();
    return true;
  }

  private merge(fromId: string, intoId: string): boolean {
    const from = this.nodeMap.get(fromId);
    const into = this.nodeMap.get(intoId);
    if (!from || !into) return false;
    for (const l of this.links) {
      if (l.source === from) l.source = into;
      if (l.target === from) l.target = into;
    }
    const seen = new Set<string>();
    this.links = this.links.filter((l) => {
      if (l.source === l.target) return false;
      const k = [l.source.id, l.target.id].sort().join("|");
      return seen.has(k) ? false : (seen.add(k), true);
    });
    this.nodes = this.nodes.filter((n) => n !== from);
    this.nodeMap.delete(fromId);
    if (this.selectedId === fromId) this.selectedId = intoId;
    this.recountDegrees();
    this.notify();
    return true;
  }

  private recountDegrees() {
    for (const n of this.nodes) n.degree = 0;
    for (const l of this.links) {
      l.source.degree++;
      l.target.degree++;
    }
  }

  setLoading(id: string, loading: boolean) {
    const n = this.nodeMap.get(id);
    if (n) {
      n.loading = loading;
      this.notify();
    }
  }

  markExpanded(id: string) {
    const n = this.nodeMap.get(id);
    if (n) {
      n.expanded = true;
      this.notify();
    }
  }

  select(id: string | null) {
    if (this.selectedId === id) return;
    this.selectedId = id;
    this.notify();
  }

  setHover(id: string | null) {
    if (this.hoverId === id) return;
    this.hoverId = id;
    this.notify();
  }

  setHighlight(ids: Set<string> | null) {
    this.highlight = ids && ids.size ? ids : null;
    this.notify();
  }

  /** Neighbours with the relation label read from this node's side. */
  connections(id: string) {
    const out: { node: SimNode; label: string; outgoing: boolean }[] = [];
    for (const l of this.links) {
      if (l.source.id === id) out.push({ node: l.target, label: l.label, outgoing: true });
      else if (l.target.id === id) out.push({ node: l.source, label: l.label, outgoing: false });
    }
    return out;
  }

  neighbourIds(id: string) {
    const ids = new Set<string>([id]);
    for (const l of this.links) {
      if (l.source.id === id) ids.add(l.target.id);
      else if (l.target.id === id) ids.add(l.source.id);
    }
    return ids;
  }

  /** Shortest path from the root to a node (breadth-first over links, both directions). */
  pathTo(id: string): SimNode[] {
    if (!this.rootId || !this.nodeMap.has(id)) return [];
    const prev = new Map<string, string | null>([[this.rootId, null]]);
    const queue = [this.rootId];
    while (queue.length) {
      const cur = queue.shift()!;
      if (cur === id) break;
      for (const n of this.neighbourIds(cur)) {
        if (!prev.has(n)) {
          prev.set(n, cur);
          queue.push(n);
        }
      }
    }
    if (!prev.has(id)) return [this.nodeMap.get(id)!];
    const path: SimNode[] = [];
    for (let cur: string | null = id; cur; cur = prev.get(cur) ?? null) path.unshift(this.nodeMap.get(cur)!);
    return path;
  }

  snapshot() {
    return {
      root: this.rootTitle,
      nodes: this.nodes.map(({ id, title, category, summary, wiki, depth }) => ({ id, title, category, summary, wiki, depth })),
      links: this.links.map((l) => ({ source: l.source.id, target: l.target.id, label: l.label })),
    };
  }
}

export function wikiOf(n: { wiki?: WikiInfo | null }) {
  return n.wiki ?? null;
}
