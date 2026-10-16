"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * A student's study progress, kept only in this browser (no account):
 * - revised topics with a spaced-repetition schedule (review after 1, 3, 7, 14, 30 days),
 * - a daily streak,
 * - the exam they're preparing for.
 */

const KEY = "throvic:study";
const LEGACY_KEY = "throvic:revised";
const EVENT = "throvic:study";
export const INTERVALS = [1, 3, 7, 14, 30];

export interface TopicProgress {
  /** Display title. */
  t: string;
  /** Step in INTERVALS. */
  l: number;
  /** Next review date, YYYY-MM-DD. */
  d: string;
  /** Last studied, YYYY-MM-DD. */
  r: string;
}

export interface Study {
  topics: Record<string, TopicProgress>;
  streak: { c: number; last: string | null };
  exam: string | null;
}

const EMPTY: Study = { topics: {}, streak: { c: 0, last: null }, exam: null };

export const today = () => new Date().toLocaleDateString("en-CA");
export function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA");
}

function read(): string {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return raw;
    // One-time import of the earlier "revised" list.
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]");
    if (Array.isArray(legacy) && legacy.length) {
      const t = today();
      const s: Study = { ...EMPTY, topics: Object.fromEntries(legacy.filter((x) => typeof x === "string").map((slug) => [slug, { t: slug.replace(/-/g, " "), l: 0, d: t, r: t }])) };
      localStorage.setItem(KEY, JSON.stringify(s));
      return JSON.stringify(s);
    }
  } catch {
    /* private mode */
  }
  return "";
}

function parse(text: string): Study {
  if (!text) return EMPTY;
  try {
    const v = JSON.parse(text) as Partial<Study>;
    return { topics: v.topics ?? {}, streak: v.streak ?? EMPTY.streak, exam: v.exam ?? null };
  } catch {
    return EMPTY;
  }
}

function write(update: (s: Study) => Study) {
  const next = update(parse(read()));
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* private mode */
  }
}

/** Counts today as a study day (keeps or starts the streak). */
function touch(s: Study): Study {
  const t = today();
  if (s.streak.last === t) return s;
  const c = s.streak.last === addDays(t, -1) ? s.streak.c + 1 : 1;
  return { ...s, streak: { c, last: t } };
}

export function markRevised(slug: string, title: string, on = true) {
  write((s) => {
    const topics = { ...s.topics };
    if (!on) {
      delete topics[slug];
      return { ...s, topics };
    }
    const t = today();
    topics[slug] = { t: title, l: 0, d: addDays(t, INTERVALS[0]), r: t };
    return touch({ ...s, topics });
  });
}

/** After a quiz: a good score moves the next review further out; a weak one brings it back to tomorrow. */
export function recordQuiz(slug: string, title: string, score: number, total: number) {
  write((s) => {
    const t = today();
    const prev = s.topics[slug];
    const passed = total > 0 && score / total >= 0.8;
    const l = passed ? Math.min((prev ? prev.l + 1 : 0), INTERVALS.length - 1) : 0;
    const topics = { ...s.topics, [slug]: { t: title, l, d: addDays(t, INTERVALS[l]), r: t } };
    return touch({ ...s, topics });
  });
}

export function setExam(slug: string | null) {
  write((s) => ({ ...s, exam: slug }));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Live study progress (empty during server rendering). */
export function useStudy() {
  const text = useSyncExternalStore(subscribe, read, () => "");
  return useMemo(() => {
    const s = parse(text);
    const t = today();
    const due = Object.entries(s.topics)
      .filter(([, p]) => p.d <= t)
      .sort((a, b) => a[1].d.localeCompare(b[1].d))
      .map(([slug, p]) => ({ slug, ...p }));
    // A streak only counts if you studied today or yesterday.
    const streak = s.streak.last === t || s.streak.last === addDays(t, -1) ? s.streak.c : 0;
    return { ...s, due, streak, studiedToday: s.streak.last === t, isRevised: (slug: string) => slug in s.topics };
  }, [text]);
}
