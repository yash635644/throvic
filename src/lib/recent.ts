"use client";

import { useMemo, useSyncExternalStore } from "react";

/** Recently explored topics, kept in this browser only. */
const KEY = "throvic:recent";
const EVENT = "throvic:recent";
const MAX = 8;

function raw() {
  try {
    return localStorage.getItem(KEY) || "[]";
  } catch {
    return "[]";
  }
}

function parse(text: string): string[] {
  try {
    const v = JSON.parse(text);
    return Array.isArray(v) ? v.filter((t) => typeof t === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function pushRecent(topic: string) {
  const next = [topic, ...parse(raw()).filter((t) => t.toLowerCase() !== topic.toLowerCase())].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* private mode */
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Live list of recent topics (empty during server rendering). */
export function useRecent(): string[] {
  const text = useSyncExternalStore(subscribe, raw, () => "[]");
  return useMemo(() => parse(text), [text]);
}
