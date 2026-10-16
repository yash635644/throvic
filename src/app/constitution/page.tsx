import { ArrowUpRight, Plus } from "lucide-react";
import { ReducedMotion } from "@/components/ui/ReducedMotion";
import type { Metadata } from "next";
import { withShare } from "@/lib/share-cards";
import Link from "@/components/ui/Link";
import { ConstitutionMap } from "@/components/site/ConstitutionMap";
import { Crumbs } from "@/components/site/Crumbs";
import { PageShell } from "@/components/site/PageShell";
import { isTopic } from "@/lib/catalog";
import { GATHERED_CONSTITUTION, gatheredArticle, gatheredPart, gatheredSchedule, KEY_ARTICLES, PARTS, SCHEDULES } from "@/lib/constitution";
import { faqJsonLd, JsonLd } from "@/lib/seo";
import { absoluteUrl, SITE } from "@/lib/site";
import { topicHref } from "@/lib/syllabus";

export const metadata: Metadata = withShare(
  {
    title: "Constitution of India Map — Parts, Schedules & Key Articles",
    description:
      "An interactive map of the Constitution of India: all 25 Parts with their articles, the 12 Schedules and key articles like 14, 21, 32, 356 and 368 — each linked to its full text.",
    alternates: { canonical: "/constitution" },
  },
  "constitution",
);

const FAQS = [
  {
    q: "How many Parts and Schedules does the Constitution of India have?",
    a: "It has 25 Parts — numbered I to XXII, with Parts IVA, IXA, IXB and XIVA added by amendments and Part VII repealed in 1956 — and 12 Schedules. When it came into force it had 395 articles in 22 Parts and 8 Schedules.",
  },
  {
    q: "When was the Constitution of India adopted?",
    a: "The Constituent Assembly adopted it on 26 November 1949, and it came into force on 26 January 1950, which is celebrated as Republic Day.",
  },
  {
    q: "Which Part of the Constitution contains the Fundamental Rights?",
    a: "Part III (Articles 12 to 35). The Directive Principles of State Policy are in Part IV (Articles 36 to 51), and the Fundamental Duties are in Part IVA (Article 51A).",
  },
  {
    q: "Which Schedule contains the Union, State and Concurrent Lists?",
    a: "The Seventh Schedule. It divides law-making subjects between the Union and the States, as set out in Part XI on Union–State relations.",
  },
];

export default function ConstitutionPage() {
  const wanted = [
    "Constitution of India",
    "Preamble to the Constitution of India",
    ...PARTS.map((p) => p.topic).filter(Boolean),
    ...KEY_ARTICLES.map((a) => a.topic).filter(Boolean),
  ] as string[];
  const topicHrefs = Object.fromEntries(wanted.filter((t) => isTopic(t)).map((t) => [t, topicHref(t)]));

  const learning = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: "Constitution of India — interactive map",
    url: absoluteUrl("/constitution"),
    description: metadata.description,
    inLanguage: SITE.language,
    learningResourceType: "Concept map",
    educationalLevel: "Competitive exam preparation",
    isAccessibleForFree: true,
    about: { "@type": "Legislation", name: "Constitution of India", legislationJurisdiction: "India", sameAs: "https://en.wikipedia.org/wiki/Constitution_of_India" },
    isPartOf: { "@id": absoluteUrl("/#website") },
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <Crumbs items={[{ name: "Home", href: "/" }, { name: "For students", href: "/students" }, { name: "Constitution of India map", href: "/constitution" }]} />

        <header className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">Indian Polity</p>
            <h1 className="mt-2 text-[36px] font-extrabold leading-[1.06] tracking-[-0.04em] text-white sm:text-[52px]">
              The Constitution of India, <span className="text-brand">as one map.</span>
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">
              All 25 Parts, the 12 Schedules and the articles asked most often — and how they connect. Tap anything to read its full text in Gathered&apos;s Constitution section.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-6">
            {[
              ["25", "Parts"],
              ["12", "Schedules"],
              ["26 Jan 1950", "In force"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="text-[13px] font-semibold text-faint">{l}</dt>
                <dd className="mt-1 text-[24px] font-extrabold tracking-[-0.03em] text-white">{n}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="mt-8">
          <ReducedMotion><ConstitutionMap topicHrefs={topicHrefs} /></ReducedMotion>
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_340px]">
          <div className="space-y-16">
            <section>
              <h2 className="text-[26px] font-extrabold tracking-[-0.03em] text-white">The 25 Parts</h2>
              <ol className="mt-5 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {PARTS.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3.5">
                    <span className="w-14 shrink-0 text-[14px] font-extrabold text-purple-light">Part {p.id}</span>
                    <a href={gatheredPart(p.id)} target="_blank" rel="noopener" className="min-w-0 flex-1 text-[16px] font-bold text-white hover:text-purple-light">
                      {p.title}
                    </a>
                    <span className="text-[13.5px] text-faint">Art. {p.articles}</span>
                    {p.note && <span className="basis-full pl-[4.5rem] text-[13px] text-faint">{p.note}</span>}
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className="text-[26px] font-extrabold tracking-[-0.03em] text-white">The 12 Schedules</h2>
              <ol className="mt-5 grid gap-x-10 border-t border-white/[0.07] sm:grid-cols-2">
                {SCHEDULES.map((s) => (
                  <li key={s.n} className="border-b border-white/[0.07] py-3.5">
                    <a href={gatheredSchedule(s.name)} target="_blank" rel="noopener" className="group block">
                      <span className="text-[13px] font-extrabold text-teal">{s.name} Schedule</span>
                      <span className="mt-0.5 block text-[15.5px] font-bold text-white group-hover:text-purple-light">{s.title}</span>
                      {s.note && <span className="mt-0.5 block text-[13px] text-faint">{s.note}</span>}
                    </a>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className="text-[26px] font-extrabold tracking-[-0.03em] text-white">Key articles</h2>
              <ol className="mt-5 grid gap-x-10 border-t border-white/[0.07] sm:grid-cols-2">
                {KEY_ARTICLES.map((a) => (
                  <li key={a.n} className="border-b border-white/[0.07]">
                    <a href={gatheredArticle(a.n)} target="_blank" rel="noopener" className="group flex items-baseline gap-4 py-3.5">
                      <span className="w-14 shrink-0 text-[14px] font-extrabold text-amber">Art. {a.n}</span>
                      <span className="text-[15.5px] font-semibold text-white group-hover:text-purple-light">{a.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className="text-[26px] font-extrabold tracking-[-0.03em] text-white">Questions about the Constitution</h2>
              <div className="mt-4 border-t border-white/[0.08]">
                {FAQS.map((f, i) => (
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
            </section>
          </div>

          <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-teal">Full text on Gathered</h2>
              <ul className="mt-3 divide-y divide-white/[0.06] border-y border-white/[0.06] text-[14.5px]">
                {[
                  [GATHERED_CONSTITUTION.home, "Every article, explained"],
                  [GATHERED_CONSTITUTION.preamble, "The Preamble, word by word"],
                  [GATHERED_CONSTITUTION.amendments, "All amendments"],
                  [GATHERED_CONSTITUTION.facts, "Key facts for exams"],
                  [GATHERED_CONSTITUTION.quiz, "Constitution quiz"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} target="_blank" rel="noopener" className="flex items-center justify-between gap-3 py-3 font-semibold text-fg/90 hover:text-white">
                      {label} <ArrowUpRight className="h-4 w-4 text-faint" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-faint">Polity topic maps</h2>
              <ul className="mt-3 space-y-1">
                {Object.entries(topicHrefs).map(([t, href]) => (
                  <li key={t}>
                    <Link href={href} className="block rounded-xl px-2 py-1.5 text-[14.5px] font-semibold text-fg/85 transition hover:bg-white/[0.04] hover:text-white">
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
      <div className="h-24" />
      <JsonLd data={learning} />
      <JsonLd data={faqJsonLd(FAQS)} />
    </PageShell>
  );
}
