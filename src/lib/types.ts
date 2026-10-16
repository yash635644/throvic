import type { Category } from "./categories";

export type Level = "simple" | "standard" | "expert";
export const LEVELS: Level[] = ["simple", "standard", "expert"];

/** What Wikipedia says about a concept (null = no matching article). */
export interface WikiInfo {
  title: string;
  url: string;
  extract: string;
  description?: string;
  thumb?: string;
  /** Sharper version of the article image for the detail panel (max ~800px wide). */
  image?: string;
  imageW?: number;
  imageH?: number;
  /** "graphic" = diagram, logo, map or flag (shown whole, never cropped). */
  imageKind?: "photo" | "graphic";
}

export interface GraphNodeData {
  /** Stable key derived from the title (see topicKey). */
  id: string;
  title: string;
  category: Category;
  summary: string;
  /** undefined = still checking, null = not found on Wikipedia. */
  wiki?: WikiInfo | null;
}

export interface GraphLinkData {
  source: string;
  target: string;
  label: string;
}

export interface GraphSnapshot {
  root: string;
  nodes: GraphNodeData[];
  links: GraphLinkData[];
}

/** One line of the NDJSON stream sent by /api/graph/*. */
export type StreamEvent =
  | { type: "meta"; root: string; rootId: string; source: "ai" | "wiki" | "cache" }
  | { type: "node"; node: GraphNodeData; parent?: string }
  | { type: "link"; link: GraphLinkData }
  | { type: "enrich"; id: string; wiki: WikiInfo | null; summary?: string }
  | { type: "merge"; from: string; into: string }
  | { type: "done"; count: number }
  | { type: "error"; message: string };
