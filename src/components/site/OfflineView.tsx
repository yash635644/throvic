"use client";

import { Flame, RotateCw, WifiOff } from "lucide-react";
import { useRecent } from "@/lib/recent";
import { useStudy } from "@/lib/study";
import { LogoMark } from "../ui/Logo";

/** Shown by the service worker when there is no connection and the page wasn't saved. */
export function OfflineView() {
  const study = useStudy();
  const recent = useRecent();
  const revised = Object.entries(study.topics)
    .sort((a, b) => (b[1].r > a[1].r ? 1 : -1))
    .slice(0, 8);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 py-16">
      <LogoMark className="h-12 w-12" />
      <p className="mt-8 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] text-amber">
        <WifiOff className="h-4 w-4" /> No connection
      </p>
      <h1 className="mt-2 text-[32px] font-extrabold leading-[1.1] tracking-[-0.04em] text-white">You&apos;re offline</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">
        New maps need the internet. Pages you opened recently still work — and your revision progress is saved on this device.
      </p>
      <button
        type="button"
        onClick={() => location.reload()}
        className="bg-brand mt-6 inline-flex h-12 w-fit items-center gap-2 rounded-full px-6 text-[15px] font-bold text-white shadow-glow"
      >
        <RotateCw className="h-4 w-4" /> Try again
      </button>

      {(study.streak > 0 || study.due.length > 0) && (
        <section className="mt-10 border-t border-white/[0.08] pt-6">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-white">
            <Flame className="h-4 w-4 text-amber" /> {study.streak}-day streak
            {study.due.length > 0 && <span className="text-muted">· {study.due.length} due for review</span>}
          </p>
        </section>
      )}

      {(revised.length > 0 || recent.length > 0) && (
        <section className="mt-6">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-faint">Recently opened</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {revised.map(([slug, t]) => (
              <li key={slug}>
                <a href={`/topic/${slug}`} className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-[14px] font-semibold text-white">
                  {t.t}
                </a>
              </li>
            ))}
            {recent.slice(0, 6).map((r) => (
              <li key={r}>
                <a href={`/explore?q=${encodeURIComponent(r)}`} className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/[0.02] px-4 text-[14px] font-medium text-fg/85">
                  {r}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12.5px] text-faint">These open only if they were saved while you were online.</p>
        </section>
      )}
    </main>
  );
}
