import { ArrowRight, Plus, Search } from "lucide-react";
import Link from "@/components/ui/Link";
import { cn } from "@/lib/cn";

/** A plain search form that opens the explorer (/explore?q=…). Works before any JavaScript loads. */
export function StartForm({ placeholder = "Type any topic — e.g. photosynthesis", cta = "Map it", className }: { placeholder?: string; cta?: string; className?: string }) {
  return (
    <form action="/explore" method="get" role="search" className={cn("flex w-full max-w-xl items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 pl-4 focus-within:border-purple/50 focus-within:ring-4 focus-within:ring-purple/15", className)}>
      <Search className="h-5 w-5 shrink-0 text-faint" aria-hidden />
      <label htmlFor="start-topic" className="sr-only">
        Topic to map
      </label>
      <input id="start-topic" name="q" required minLength={2} maxLength={120} placeholder={placeholder} enterKeyHint="go" className="h-11 min-w-0 flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-faint" />
      <button type="submit" className="bg-brand inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-4 text-[15px] font-bold text-white shadow-glow transition hover:brightness-110">
        {cta} <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

/** Numbered steps (pair with howToJsonLd). */
export function Steps({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <ol className="mt-6 grid gap-6 sm:grid-cols-3">
      {steps.map((s, i) => (
        <li key={s.title} id={`step-${i + 1}`} className="reveal scroll-mt-28 border-t border-white/[0.1] pt-5">
          <span className="text-brand text-[15px] font-extrabold">Step {i + 1}</span>
          <h3 className="mt-1.5 text-[18px] font-extrabold tracking-[-0.02em] text-white">{s.title}</h3>
          <p className="mt-1.5 text-[15.5px] leading-relaxed text-muted">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** Open/close questions (pair with faqJsonLd). */
export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="mt-5 border-t border-white/[0.08]">
      {faqs.map((f, i) => (
        <details key={f.q} className="faq group border-b border-white/[0.08]" open={i === 0}>
          <summary className="flex cursor-pointer items-center justify-between gap-6 py-4 text-left">
            <h3 className="text-[16.5px] font-bold text-white group-hover:text-purple-light">{f.q}</h3>
            <span className="faq-icon grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.06] text-muted transition-transform duration-300">
              <Plus className="h-4 w-4" />
            </span>
          </summary>
          <p className="pb-5 text-[15.5px] leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Topic chips that link to ready-made topic maps. */
export function TopicChips({ topics }: { topics: { title: string; href: string; color?: string }[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {topics.map((t) => (
        <li key={t.href}>
          <Link href={t.href} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3.5 text-[14px] font-semibold text-fg/90 transition hover:border-white/25 hover:text-white">
            {t.color && <span className="h-2 w-2 rounded-full" style={{ background: t.color }} aria-hidden />}
            {t.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SectionTitle({ id, eyebrow, children }: { id?: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <>
      {eyebrow && <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">{eyebrow}</p>}
      <h2 id={id} className="mt-1.5 scroll-mt-28 text-[26px] font-extrabold leading-[1.15] tracking-[-0.035em] text-white sm:text-[32px]">
        {children}
      </h2>
    </>
  );
}
