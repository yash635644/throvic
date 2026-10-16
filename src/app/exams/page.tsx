import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { withShare } from "@/lib/share-cards";
import Link from "@/components/ui/Link";
import { Crumbs } from "@/components/site/Crumbs";
import { PageShell } from "@/components/site/PageShell";
import { CENTRAL_EXAMS, GATHERED, GROUPS, STATE_EXAMS, STATES, type ExamGroup } from "@/lib/exams";
import { slugify } from "@/lib/keys";
import { JsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = withShare(
  {
    title: "Government Exam Preparation — Central & State Exams",
    description:
      "Knowledge maps for UPSC, SSC, banking, railways, defence and every state PSC and staff selection board exam — history, polity, geography, economy, science and state studies, topic by topic.",
    alternates: { canonical: "/exams" },
  },
  "exams",
);

const CENTRAL_ORDER: ExamGroup[] = ["civil-services", "ssc", "banking", "insurance", "railways", "defence"];

export default function ExamsPage() {
  const total = CENTRAL_EXAMS.length + STATE_EXAMS.length;
  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Government exam preparation on Throvic",
    url: absoluteUrl("/exams"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: total,
      itemListElement: [...CENTRAL_EXAMS, ...STATE_EXAMS].map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.name, url: absoluteUrl(`/exams/${e.slug}`) })),
    },
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <Crumbs items={[{ name: "Home", href: "/" }, { name: "For students", href: "/students" }, { name: "Exams", href: "/exams" }]} />
        <header className="mt-6 max-w-3xl">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">Exam preparation</p>
          <h1 className="mt-2 text-[36px] font-extrabold leading-[1.08] tracking-[-0.04em] text-white sm:text-[52px]">
            Every government exam, <span className="text-brand">mapped topic by topic.</span>
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            Pick your exam to see its general studies and general awareness subjects as connected knowledge maps — {total} central and state exams, from UPSC to your state&apos;s PSC and staff selection board.
          </p>
          <p className="mt-3 text-[15px] text-faint">
            For daily current affairs by exam, use{" "}
            <a href={GATHERED.todayCurrentAffairs} target="_blank" rel="noopener" className="font-semibold text-teal hover:underline">
              Gathered
            </a>
            , our sister site.
          </p>
        </header>

        {/* jump links */}
        <nav aria-label="Exam groups" className="mt-10 flex flex-wrap gap-2">
          {[...CENTRAL_ORDER, "state-psc" as const, "state-ssb" as const].map((g) => (
            <a key={g} href={`#${g}`} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[13.5px] font-semibold text-fg/90 transition hover:border-white/20 hover:text-white">
              {GROUPS[g].label}
            </a>
          ))}
        </nav>

        <h2 className="mt-16 text-[13px] font-bold uppercase tracking-[0.14em] text-faint">Central exams</h2>
        <div className="mt-6 space-y-14">
          {CENTRAL_ORDER.map((g) => {
            const list = CENTRAL_EXAMS.filter((e) => e.group === g);
            return (
              <section key={g} id={g} className="scroll-mt-28 grid gap-6 border-t border-white/[0.07] pt-8 lg:grid-cols-[300px_1fr] lg:gap-12">
                <div>
                  <h3 className="text-[22px] font-extrabold tracking-[-0.03em] text-white">{GROUPS[g].label}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{GROUPS[g].blurb}</p>
                  <a href={GATHERED.examCurrentAffairs(list[0].gathered)} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-semibold text-teal hover:underline">
                    Current affairs on Gathered <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
                <ul className="grid gap-x-8 sm:grid-cols-2">
                  {list.map((e) => (
                    <li key={e.slug} className="border-b border-white/[0.06]">
                      <Link href={`/exams/${e.slug}`} className="group flex items-center justify-between gap-4 py-3.5">
                        <span>
                          <span className="block text-[16px] font-bold text-white group-hover:text-purple-light">{e.short}</span>
                          <span className="block text-[13px] text-faint">{e.body}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-white" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <h2 id="state-psc" className="mt-20 scroll-mt-28 text-[13px] font-bold uppercase tracking-[0.14em] text-faint">
          State exams
        </h2>
        <p id="state-ssb" className="mt-2 max-w-2xl scroll-mt-28 text-[15px] text-muted">
          Each state&apos;s Public Service Commission and staff selection board, with state history, geography, culture, economy and politics maps.
        </p>
        <div className="mt-8 grid gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {STATES.map((state) => {
            const list = STATE_EXAMS.filter((e) => e.state === state);
            return (
              <section key={state} id={slugify(state)} className="scroll-mt-28 border-t border-white/[0.07] py-5">
                <h3 className="text-[17px] font-extrabold tracking-[-0.02em] text-white">{state}</h3>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {list.map((e) => (
                    <li key={e.slug}>
                      <Link href={`/exams/${e.slug}`} className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[13px] font-semibold text-fg/90 transition hover:border-purple/40 hover:text-white">
                        {e.short}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
      <div className="h-24" />
      <JsonLd data={itemList} />
    </PageShell>
  );
}
