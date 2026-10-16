"use client";

import { ArrowLeft, ArrowRight, Check, CheckCircle2, Flame, RotateCcw, Shuffle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/cn";
import { markRevised, recordQuiz, today, useStudy } from "@/lib/study";
import type { GraphNodeData, GraphSnapshot } from "@/lib/types";

/**
 * Flashcards and a quiz built from the topic's verified map — no extra AI calls. Questions are
 * generated from the concepts' own summaries and relationship labels, with a seeded shuffle so
 * the server and browser render the same first round.
 */

const nameOf = (n: GraphNodeData) => n.wiki?.title ?? n.title;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
function shuffle<T>(list: T[], rand: () => number) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Hides a concept's own name (and its main words) inside its summary. */
function mask(text: string, name: string) {
  let out = text;
  const words = [name, ...name.split(/[\s()–-]+/).filter((w) => w.length > 3)];
  for (const w of words) out = out.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "_____");
  return out;
}

type Question = { prompt: string; context?: string; options: string[]; answer: string; explain: string };

function buildQuiz(snapshot: GraphSnapshot, root: GraphNodeData, seed: number): Question[] {
  const rand = rng(seed);
  const concepts = snapshot.nodes.filter((n) => n.id !== root.id);
  if (concepts.length < 4) return [];
  const names = concepts.map(nameOf);
  const pick = (correct: string) => shuffle([correct, ...shuffle(names.filter((n) => n !== correct), rand).slice(0, 3)], rand);
  const questions: Question[] = [];

  // Relationship questions, only where the label points to one concept.
  const rootLinks = snapshot.links.filter((l) => l.label && (l.source === root.id || l.target === root.id));
  const counts = new Map<string, number>();
  for (const l of rootLinks) counts.set(l.label, (counts.get(l.label) ?? 0) + 1);
  for (const l of shuffle(rootLinks, rand)) {
    if (counts.get(l.label) !== 1) continue;
    const other = concepts.find((c) => c.id === (l.source === root.id ? l.target : l.source));
    if (!other) continue;
    const outgoing = l.source === root.id;
    questions.push({
      prompt: outgoing ? `${nameOf(root)} — ${l.label} — ?` : `? — ${l.label} — ${nameOf(root)}`,
      context: "Which concept completes this relationship?",
      options: pick(nameOf(other)),
      answer: nameOf(other),
      explain: other.summary,
    });
  }
  // Description questions.
  for (const c of shuffle(concepts.filter((x) => x.summary.length > 40), rand)) {
    questions.push({ prompt: mask(c.summary, nameOf(c)), context: "Which concept does this describe?", options: pick(nameOf(c)), answer: nameOf(c), explain: c.summary });
  }
  return shuffle(questions, rand).slice(0, 5);
}

export function TopicRevision({ snapshot, slug }: { snapshot: GraphSnapshot; slug: string }) {
  const root = snapshot.nodes[0];
  const cards = useMemo(() => snapshot.nodes.filter((n) => n.id !== root?.id && n.summary), [snapshot, root]);
  const [tab, setTab] = useState<"cards" | "quiz">("cards");
  const study = useStudy();
  const isRevised = study.isRevised(slug);
  const progress = study.topics[slug];
  const due = !!progress && progress.d <= today();
  const title = root ? nameOf(root) : slug;

  /* flashcards */
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[order[index]];
  const relation = (c: GraphNodeData) => {
    const l = snapshot.links.find((x) => (x.source === root.id && x.target === c.id) || (x.target === root.id && x.source === c.id));
    if (!l?.label) return null;
    return l.source === root.id ? `${nameOf(root)} — ${l.label} — ${nameOf(c)}` : `${nameOf(c)} — ${l.label} — ${nameOf(root)}`;
  };
  const go = (d: number) => {
    setFlipped(false);
    setIndex((i) => (i + d + cards.length) % cards.length);
  };

  /* quiz */
  const [round, setRound] = useState(0);
  const quiz = useMemo(() => (root ? buildQuiz(snapshot, root, hash(slug) + round * 7919) : []), [snapshot, root, slug, round]);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [q, setQ] = useState(0);
  const done = quiz.length > 0 && answers.filter(Boolean).length === quiz.length;
  const score = answers.filter((a, i) => a === quiz[i]?.answer).length;
  const restart = () => {
    setRound((r) => r + 1);
    setAnswers([]);
    setQ(0);
  };

  if (!root || cards.length < 2) return null;

  return (
    <section className="mt-12" aria-labelledby="revise">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="revise" className="text-[24px] font-extrabold tracking-[-0.03em] text-white">
            Revise {nameOf(root)}
          </h2>
          <p className="mt-1 text-[14.5px] text-muted">Flashcards and a quick quiz, built from this map.</p>
        </div>
        <button
          type="button"
          onClick={() => markRevised(slug, title, !isRevised)}
          aria-pressed={isRevised}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13.5px] font-bold transition",
            isRevised ? "border-teal/40 bg-teal/15 text-teal" : "border-white/10 bg-white/[0.04] text-fg hover:bg-white/[0.08]",
          )}
        >
          <CheckCircle2 className="h-4 w-4" /> {isRevised ? "Revised" : "Mark as revised"}
        </button>
      </div>

      {due && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber/30 bg-amber/10 px-4 py-3">
          <p className="flex items-center gap-2 text-[14.5px] font-semibold text-white">
            <Flame className="h-4 w-4 text-amber" /> Due for review today — a quick quiz keeps it fresh{study.streak > 0 ? ` and your ${study.streak}-day streak alive` : ""}.
          </p>
          <button type="button" onClick={() => setTab("quiz")} className="inline-flex h-9 items-center rounded-full bg-amber px-4 text-[13.5px] font-bold text-[#0d0d14]">
            Take the quiz
          </button>
        </div>
      )}
      {isRevised && !due && progress && (
        <p className="mt-3 text-[13.5px] text-faint">
          Next review: <span className="font-semibold text-muted">{new Date(`${progress.d}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
        </p>
      )}

      <div role="tablist" aria-label="Revision mode" className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
        {(["cards", "quiz"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("relative rounded-full px-4 py-1.5 text-[13.5px] font-bold transition", tab === t ? "text-white" : "text-muted hover:text-white")}>
            {tab === t && <motion.span layoutId={`rev-${slug}`} className="bg-brand absolute inset-0 rounded-full" transition={{ type: "spring", damping: 28, stiffness: 380 }} />}
            <span className="relative">{t === "cards" ? `Flashcards · ${cards.length}` : "Quiz · 5 questions"}</span>
          </button>
        ))}
      </div>

      {tab === "cards" && card && (
        <div className="mt-6">
          <button type="button" onClick={() => setFlipped((f) => !f)} aria-label={flipped ? "Show the front" : "Show the answer"} className="block w-full [perspective:1400px]">
            <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: "spring", damping: 22, stiffness: 160 }} className="relative h-[260px] w-full [transform-style:preserve-3d] sm:h-[240px]">
              <div className="absolute inset-0 flex flex-col justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-7 text-left [backface-visibility:hidden]">
                <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: (CATEGORIES[card.category] ?? CATEGORIES.other).color }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: (CATEGORIES[card.category] ?? CATEGORIES.other).color }} />
                  {(CATEGORIES[card.category] ?? CATEGORIES.other).label}
                </span>
                <span className="mt-3 text-[28px] font-extrabold tracking-[-0.03em] text-white">{nameOf(card)}</span>
                {relation(card) && <span className="mt-2 text-[15px] text-muted">{relation(card)}</span>}
                <span className="mt-auto text-[13px] font-semibold text-faint">Tap to reveal what it is →</span>
              </div>
              <div className="absolute inset-0 flex flex-col justify-center overflow-y-auto rounded-3xl border border-purple/30 bg-[#16162a] p-7 text-left [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="text-[13px] font-bold text-purple-light">{nameOf(card)}</span>
                <span className="mt-2 text-[16.5px] leading-relaxed text-fg/90">{card.summary}</span>
              </div>
            </motion.div>
          </button>
          <div className="mt-4 flex items-center justify-between gap-3">
            <button type="button" onClick={() => go(-1)} aria-label="Previous card" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-muted hover:bg-white/[0.06] hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-[13.5px] font-semibold tabular-nums text-faint">
              {index + 1} / {cards.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOrder((o) => shuffle(o, rng(Date.now())));
                  setIndex(0);
                  setFlipped(false);
                }}
                aria-label="Shuffle cards"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-muted hover:bg-white/[0.06] hover:text-white"
              >
                <Shuffle className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next card" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-muted hover:bg-white/[0.06] hover:text-white">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "quiz" && quiz.length > 0 && (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key={`q${round}-${q}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between text-[13px] font-semibold text-faint">
                  <span>
                    Question {q + 1} of {quiz.length}
                  </span>
                  <span className="flex gap-1">
                    {quiz.map((_, i) => (
                      <span key={i} className={cn("h-1.5 w-6 rounded-full", i < q ? (answers[i] === quiz[i].answer ? "bg-teal" : "bg-coral") : i === q ? "bg-purple" : "bg-white/10")} />
                    ))}
                  </span>
                </div>
                <p className="mt-4 text-[13px] font-bold uppercase tracking-[0.12em] text-purple-light">{quiz[q].context}</p>
                <p className="mt-2 text-[18px] font-bold leading-relaxed text-white">{quiz[q].prompt}</p>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {quiz[q].options.map((o) => {
                    const chosen = answers[q];
                    const isAnswer = o === quiz[q].answer;
                    return (
                      <li key={o}>
                        <button
                          type="button"
                          disabled={!!chosen}
                          onClick={() => {
                            const next = Object.assign([...answers], { [q]: o });
                            setAnswers(next);
                            // Finished: update the revision schedule and the streak.
                            if (next.filter(Boolean).length === quiz.length) recordQuiz(slug, title, next.filter((a, i) => a === quiz[i].answer).length, quiz.length);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] font-semibold transition",
                            !chosen && "border-white/10 bg-white/[0.03] text-fg hover:border-purple/40 hover:bg-purple/10",
                            chosen && isAnswer && "border-teal/50 bg-teal/12 text-white",
                            chosen && chosen === o && !isAnswer && "border-coral/50 bg-coral/12 text-white",
                            chosen && chosen !== o && !isAnswer && "border-white/[0.06] text-faint",
                          )}
                        >
                          {o}
                          {chosen && isAnswer && <Check className="h-4 w-4 shrink-0 text-teal" />}
                          {chosen === o && !isAnswer && <X className="h-4 w-4 shrink-0 text-coral" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {answers[q] && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex flex-wrap items-end justify-between gap-4">
                    <p className="max-w-xl text-[14px] leading-relaxed text-muted">
                      <span className="font-bold text-white">{quiz[q].answer}: </span>
                      {quiz[q].explain}
                    </p>
                    <button type="button" onClick={() => setQ((x) => Math.min(quiz.length - 1, x + 1))} className="bg-brand inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-[14px] font-bold text-white">
                      {q === quiz.length - 1 ? "See result" : "Next"} <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div key={`r${round}`} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">Your score</p>
                <p className="text-brand mt-2 text-[56px] font-extrabold leading-none">
                  {score}/{quiz.length}
                </p>
                <p className="mt-3 text-[15px] text-muted">{score === quiz.length ? "Perfect — this topic is yours." : score >= 3 ? "Nicely done. Review the misses below." : "Have another look at the map, then try again."}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={restart} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-[14px] font-bold text-white hover:bg-white/[0.08]">
                    <RotateCcw className="h-4 w-4" /> New questions
                  </button>
                  {score >= 4 && !isRevised && (
                    <button type="button" onClick={() => markRevised(slug, title)} className="bg-brand inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14px] font-bold text-white">
                      <CheckCircle2 className="h-4 w-4" /> Mark as revised
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
