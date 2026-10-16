import type { Metadata } from "next";
import { withShare } from "@/lib/share-cards";
import Link from "@/components/ui/Link";
import { notFound } from "next/navigation";
import { Crumbs } from "@/components/site/Crumbs";
import { PageShell } from "@/components/site/PageShell";
import { topicsOfState } from "@/lib/catalog";
import { examsWithSubject, STATES } from "@/lib/exams";
import { slugify } from "@/lib/keys";
import { JsonLd } from "@/lib/seo";
import { absoluteUrl, exploreUrl } from "@/lib/site";
import { SUBJECTS, subjectBySlug, topicHref } from "@/lib/syllabus";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = subjectBySlug(slug);
  if (!s) return {};
  return withShare(
    {
      title: `${s.name} Mind Maps — Topic-wise for UPSC & State Exams`,
      description: `${s.blurb} Explore every topic as an interactive, Wikipedia-verified knowledge map.`,
      alternates: { canonical: `/subjects/${slug}` },
    },
    `subject-${slug}`,
  );
}

export default async function SubjectPage({ params }: Props) {
  const { slug } = await params;
  const s = subjectBySlug(slug);
  if (!s) notFound();
  const exams = examsWithSubject(s.slug);
  const isState = s.slug === "state-studies";
  const titles = isState ? STATES.flatMap((st) => topicsOfState(st).map((t) => t.title)) : s.topics;
  const list = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${s.name} — knowledge maps`,
    url: absoluteUrl(`/subjects/${slug}`),
    isPartOf: { "@id": absoluteUrl("/#website") },
    mainEntity: { "@type": "ItemList", itemListElement: titles.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t, url: absoluteUrl(topicHref(t)) })) },
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <Crumbs items={[{ name: "Home", href: "/" }, { name: "For students", href: "/students" }, { name: "Subjects", href: "/subjects" }, { name: s.name, href: `/subjects/${slug}` }]} />
        <header className="mt-6 max-w-3xl">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: s.color }}>
            Subject
          </p>
          <h1 className="mt-2 text-[34px] font-extrabold leading-[1.08] tracking-[-0.04em] text-white sm:text-[48px]">{s.name}</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">{s.blurb}</p>
          {s.slug === "polity" && (
            <Link href="/constitution" className="bg-brand mt-6 inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14.5px] font-bold text-white shadow-glow transition hover:brightness-110">
              Open the Constitution of India map
            </Link>
          )}
        </header>

        {isState ? (
          <div className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {STATES.map((st) => (
              <section key={st} id={slugify(st)} className="scroll-mt-28 border-t border-white/[0.07] py-6">
                <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-white">{st}</h2>
                <ul className="mt-3 space-y-1">
                  {topicsOfState(st).map((t) => (
                    <li key={t.slug}>
                      <Link href={`/topic/${t.slug}`} className="text-[14.5px] font-medium text-fg/85 transition hover:text-purple-light">
                        {t.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <ol className="mt-12 grid gap-x-10 border-t border-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
            {s.topics.map((t, i) => (
              <li key={t} className="border-b border-white/[0.07]">
                <Link href={topicHref(t)} className="group flex items-baseline gap-4 py-4">
                  <span className="w-6 shrink-0 text-[13px] font-bold tabular-nums text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[16.5px] font-bold text-white transition group-hover:text-purple-light">{t}</span>
                </Link>
              </li>
            ))}
          </ol>
        )}

        <section className="mt-16 max-w-4xl">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-faint">Appears in {exams.length} exams</h2>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {exams.map((e) => (
              <li key={e.slug}>
                <Link href={`/exams/${e.slug}`} className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[13px] font-semibold text-fg/90 transition hover:border-white/20 hover:text-white">
                  {e.short}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[15px] text-muted">
            Looking for something not listed?{" "}
            <Link href={exploreUrl(s.name)} className="font-semibold text-purple-light hover:underline">
              Explore {s.name} freely
            </Link>
            .
          </p>
        </section>
      </div>
      <div className="h-24" />
      <JsonLd data={list} />
    </PageShell>
  );
}
