"use client";

import { ArrowRight, CheckCircle2, Flame, Target } from "lucide-react";
import Link from "@/components/ui/Link";
import { useMemo } from "react";
import { topicsOfState } from "@/lib/catalog";
import { CENTRAL_EXAMS, examBySlug, STATE_EXAMS } from "@/lib/exams";
import { slugify } from "@/lib/keys";
import { setExam, useStudy } from "@/lib/study";
import { subjectBySlug } from "@/lib/syllabus";

/** Syllabus of one exam: its subjects, each with topic slugs and titles. */
function syllabusOf(examSlug: string | null) {
  const exam = examSlug ? examBySlug(examSlug) : undefined;
  if (!exam) return null;
  const groups = exam.subjects
    .filter((s) => s !== "state-studies")
    .map((s) => {
      const subject = subjectBySlug(s)!;
      return { name: subject.name, color: subject.color, topics: subject.topics.map((t) => ({ slug: slugify(t), title: t })) };
    });
  if (exam.state) groups.unshift({ name: `${exam.state} state studies`, color: "#afa9ec", topics: topicsOfState(exam.state).map((t) => ({ slug: t.slug, title: t.title })) });
  return { exam, groups };
}

/** "Your study" panel on the Students page: streak, reviews due, and progress for the chosen exam. */
export function StudyDashboard() {
  const study = useStudy();
  const plan = useMemo(() => syllabusOf(study.exam), [study.exam]);
  const revisedCount = Object.keys(study.topics).length;

  const totals = plan
    ? plan.groups.reduce(
        (acc, g) => {
          acc.all += g.topics.length;
          acc.done += g.topics.filter((t) => study.isRevised(t.slug)).length;
          return acc;
        },
        { all: 0, done: 0 },
      )
    : null;
  const upNext = plan ? plan.groups.flatMap((g) => g.topics.filter((t) => !study.isRevised(t.slug)).slice(0, 1).map((t) => ({ ...t, subject: g.name }))).slice(0, 4) : [];

  return (
    <section aria-labelledby="your-study" className="mt-12 rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.045] to-white/[0.01] p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-teal">Your study</p>
          <h2 id="your-study" className="mt-1 text-[24px] font-extrabold tracking-[-0.03em] text-white sm:text-[28px]">
            {study.studiedToday ? "Nice work today." : study.due.length ? `${study.due.length} topic${study.due.length === 1 ? "" : "s"} to review today` : "Ready when you are."}
          </h2>
          <p className="mt-1 text-[13.5px] text-faint">Saved on this device — no account needed.</p>
        </div>
        <dl className="flex gap-6">
          <div>
            <dt className="text-[12px] font-semibold text-faint">Streak</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-[24px] font-extrabold text-white">
              <Flame className={study.streak ? "h-5 w-5 text-amber" : "h-5 w-5 text-faint"} /> {study.streak}
              <span className="text-[13px] font-semibold text-faint">day{study.streak === 1 ? "" : "s"}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[12px] font-semibold text-faint">Revised</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-[24px] font-extrabold text-white">
              <CheckCircle2 className="h-5 w-5 text-teal" /> {revisedCount}
            </dd>
          </div>
        </dl>
      </div>

      {study.due.length > 0 && (
        <div className="mt-6">
          <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-amber">Due today</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {study.due.slice(0, 8).map((d) => (
              <li key={d.slug}>
                <Link href={`/topic/${d.slug}#revise`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-4 text-[14px] font-semibold capitalize text-white transition hover:bg-amber/20">
                  {d.t} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-7 border-t border-white/[0.07] pt-6">
        <label htmlFor="my-exam" className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">
          <Target className="h-4 w-4" /> My exam
        </label>
        <select
          id="my-exam"
          value={study.exam ?? ""}
          onChange={(e) => setExam(e.target.value || null)}
          className="mt-2 h-12 w-full max-w-md rounded-xl border border-white/10 bg-[#13131c] px-3 text-[15px] font-semibold text-white outline-none focus:border-purple/50 focus:ring-4 focus:ring-purple/15"
        >
          <option value="">Choose your exam to track progress…</option>
          <optgroup label="Central exams">
            {CENTRAL_EXAMS.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.short}
              </option>
            ))}
          </optgroup>
          <optgroup label="State exams">
            {STATE_EXAMS.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.short} — {e.state}
              </option>
            ))}
          </optgroup>
        </select>

        {plan && totals && (
          <div className="mt-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[15px] font-semibold text-white">
                {totals.done} of {totals.all} topics revised for {plan.exam.short}
              </p>
              <p className="text-[14px] font-bold tabular-nums text-teal">{Math.round((totals.done / Math.max(1, totals.all)) * 100)}%</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]" role="progressbar" aria-valuemin={0} aria-valuemax={totals.all} aria-valuenow={totals.done} aria-label={`${plan.exam.short} syllabus revised`}>
              <div className="bg-brand h-full rounded-full transition-all duration-700" style={{ width: `${(totals.done / Math.max(1, totals.all)) * 100}%` }} />
            </div>

            <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {plan.groups.map((g) => {
                const done = g.topics.filter((t) => study.isRevised(t.slug)).length;
                return (
                  <li key={g.name}>
                    <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                      <span className="font-semibold text-fg/90">{g.name}</span>
                      <span className="tabular-nums text-faint">
                        {done}/{g.topics.length}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full" style={{ width: `${(done / Math.max(1, g.topics.length)) * 100}%`, background: g.color }} />
                    </div>
                  </li>
                );
              })}
            </ul>

            {upNext.length > 0 && (
              <div className="mt-6">
                <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-faint">Up next</h3>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {upNext.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/topic/${t.slug}`} className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 transition hover:border-white/20">
                        <span>
                          <span className="block text-[14.5px] font-bold text-white group-hover:text-purple-light">{t.title}</span>
                          <span className="block text-[12px] text-faint">{t.subject}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-faint" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/** "Set as my exam" toggle for exam pages. */
export function MyExamButton({ slug, short }: { slug: string; short: string }) {
  const study = useStudy();
  const mine = study.exam === slug;
  return (
    <button
      type="button"
      onClick={() => setExam(mine ? null : slug)}
      aria-pressed={mine}
      className={
        mine
          ? "inline-flex h-11 items-center gap-2 rounded-full border border-teal/40 bg-teal/15 px-5 text-[14px] font-bold text-teal"
          : "bg-brand inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14px] font-bold text-white shadow-glow transition hover:brightness-110"
      }
    >
      <Target className="h-4 w-4" /> {mine ? `${short} is my exam` : `Set ${short} as my exam`}
    </button>
  );
}
