import { ArrowRight, ArrowUpRight, BadgeCheck, BookOpen, Newspaper, Plus } from "lucide-react";
import { ReducedMotion } from "@/components/ui/ReducedMotion";
import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Crumbs } from "@/components/site/Crumbs";
import { PageShell } from "@/components/site/PageShell";
import { TopicMap } from "@/components/site/TopicMap";
import { InTheNews } from "@/components/site/InTheNews";
import { TopicRevision } from "@/components/site/TopicRevision";
import { examsForTopic, isTopic, siblings, subjectsForTopic, topicBySlug } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/categories";
import { GATHERED, GATHERED_LABEL } from "@/lib/exams";
import { topicSnapshot } from "@/lib/graph-engine";
import { slugify } from "@/lib/keys";
import { faqJsonLd, JsonLd } from "@/lib/seo";
import { absoluteUrl, exploreUrl, SITE } from "@/lib/site";
import { subjectBySlug, topicHref } from "@/lib/syllabus";
import type { GraphNodeData, GraphSnapshot } from "@/lib/types";

// Topic maps change rarely: build on first visit, then refresh weekly.
export const revalidate = 604800;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

const firstSentences = (text = "", max = 300) => {
  const parts = text.match(/[^.!?]+[.!?]+/g) || [text];
  let out = "";
  for (const p of parts) {
    if ((out + p).length > max && out) break;
    out += p;
  }
  return out.trim();
};

// Shared by generateMetadata and the page, so the map is built once per request.
const load = cache(async (slug: string) => {
  const topic = topicBySlug(slug);
  if (!topic) return null;
  const snapshot = await topicSnapshot(topic.title);
  const root = snapshot.nodes.find((n) => slugify(n.title) === slugify(snapshot.root)) ?? snapshot.nodes[0];
  return { topic, snapshot, root };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = topicBySlug(slug);
  if (!topic) return {};
  const data = await load(slug);
  const name = data?.root?.wiki?.title ?? topic.title;
  const lead = firstSentences(data?.root?.wiki?.extract || data?.root?.summary, 150);
  const exams = examsForTopic(topic);
  const forExams = exams.length ? ` for ${[...new Set(exams.map((e) => e.gathered === "upsc" ? "UPSC" : e.gathered === "state-psc" ? "state PSC" : e.short))].slice(0, 3).join(", ")}` : "";
  // Under ~160 characters so search results show it whole: the opening of the article, then what the page offers.
  const suffix = `Interactive mind map, flashcards and quiz${forExams}.`;
  const room = 158 - suffix.length;
  const opening = lead.length > room ? `${lead.slice(0, room).replace(/[\s,;:—-]+\S*$/, "")}…` : lead;
  const description = `${opening ? `${opening} ` : ""}${suffix}`;
  return {
    title: `${name} Mind Map: Key Concepts, Flashcards & Quiz`,
    description,
    alternates: { canonical: `/topic/${slug}` },
    openGraph: { type: "article", siteName: SITE.name, locale: SITE.locale, title: `${name} — mind map & key concepts`, description, url: absoluteUrl(`/topic/${slug}`) },
    twitter: { card: "summary_large_image", title: `${name} — mind map & key concepts`, description, images: [absoluteUrl(`/topic/${slug}/opengraph-image`)] },
  };
}

function relation(snapshot: GraphSnapshot, rootId: string, id: string) {
  const l = snapshot.links.find((x) => (x.source === rootId && x.target === id) || (x.target === rootId && x.source === id));
  if (!l?.label) return null;
  return l.source === rootId ? l.label : `← ${l.label}`;
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data || !data.root) notFound();
  const { topic, snapshot, root } = data;
  const name = root.wiki?.title ?? topic.title;
  const subjects = subjectsForTopic(topic);
  const subject = subjectBySlug(topic.subject)!;
  const exams = examsForTopic(topic);
  const concepts = snapshot.nodes.filter((n) => n.id !== root.id);
  const related = siblings(topic);
  const examGroups = [...new Set(exams.map((e) => e.gathered))];
  const isPolity = subjects.some((s) => s.slug === "polity");
  const isUpsc = exams.some((e) => e.gathered === "upsc");

  // Concepts with their own topic page link there.
  const topicLinks: Record<string, string> = {};
  for (const n of snapshot.nodes) {
    const t = n.wiki?.title ?? n.title;
    if (isTopic(t) && slugify(t) !== slug) topicLinks[n.id] = topicHref(t);
  }
  const conceptHref = (n: GraphNodeData) => topicLinks[n.id] ?? exploreUrl(n.wiki?.title ?? n.title);

  const intro = root.wiki?.extract || root.summary;
  const faqs = [
    { q: `What is ${name}?`, a: firstSentences(intro, 420) || `${name} is a topic in ${subject.name}.` },
    concepts.length > 0 && {
      q: `What are the key concepts related to ${name}?`,
      a: `The main concepts connected to ${name} include ${concepts.slice(0, 8).map((c) => c.wiki?.title ?? c.title).join(", ")}. Each is linked on the map above with its own summary.`,
    },
    exams.length > 0 && {
      q: `Which exams cover ${name}?`,
      a: `${name} is part of ${subjects.map((s) => s.name).join(" and ")}, which appears in the syllabus of ${exams.slice(0, 6).map((e) => e.short).join(", ")}${exams.length > 6 ? ` and ${exams.length - 6} more exams` : ""}.`,
    },
  ].filter(Boolean) as { q: string; a: string }[];

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "For students", href: "/students" },
    { name: "Subjects", href: "/subjects" },
    { name: subject.name, href: `/subjects/${subject.slug}` },
    ...(topic.state ? [{ name: topic.state, href: `/subjects/state-studies#${slugify(topic.state)}` }] : []),
    { name, href: `/topic/${slug}` },
  ];

  const learning = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "@id": absoluteUrl(`/topic/${slug}#resource`),
    name: `${name} — knowledge map`,
    description: firstSentences(intro, 250),
    url: absoluteUrl(`/topic/${slug}`),
    inLanguage: SITE.language,
    learningResourceType: "Concept map",
    educationalLevel: "Competitive exam preparation",
    isAccessibleForFree: true,
    about: { "@type": "Thing", name, ...(root.wiki?.url ? { sameAs: root.wiki.url } : {}) },
    teaches: concepts.slice(0, 10).map((c) => c.wiki?.title ?? c.title),
    audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: exams.slice(0, 8).map((e) => e.short).join(", ") },
    isPartOf: { "@id": absoluteUrl("/#website") },
    publisher: { "@id": absoluteUrl("/#organization") },
    citation: root.wiki?.url,
  };

  // Google "Education Q&A" rich result: the flashcards shown on this page (front: concept, back: summary).
  const flashcards = concepts.filter((c) => c.summary);
  const quiz = flashcards.length >= 2 && {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "@id": absoluteUrl(`/topic/${slug}#flashcards`),
    name: `${name} flashcards`,
    about: { "@type": "Thing", name },
    educationalAlignment: [{ "@type": "AlignmentObject", alignmentType: "educationalSubject", targetName: subject.name }],
    isPartOf: { "@id": absoluteUrl(`/topic/${slug}#resource`) },
    hasPart: flashcards.map((c) => ({
      "@type": "Question",
      eduQuestionType: "Flashcard",
      text: c.wiki?.title ?? c.title,
      acceptedAnswer: { "@type": "Answer", text: c.summary },
    })),
  };

  return (
    <PageShell>
      <article className="mx-auto max-w-7xl px-5 sm:px-6">
        <Crumbs items={crumbs} />

        <header className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: subject.color }}>
              {subject.name}
              {topic.state ? ` · ${topic.state}` : ""}
            </p>
            <h1 className="mt-2 text-[36px] font-extrabold leading-[1.08] tracking-[-0.04em] text-white sm:text-[52px]">{name}</h1>
            {root.wiki?.description && <p className="mt-2 text-[17px] text-muted first-letter:uppercase">{root.wiki.description}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {root.wiki && (
              <a href={root.wiki.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-teal/12 px-3 py-1.5 text-[13px] font-bold text-teal hover:bg-teal/20">
                <BadgeCheck className="h-4 w-4" /> Verified on Wikipedia
              </a>
            )}
            <span className="inline-flex items-center rounded-full bg-white/[0.06] px-3 py-1.5 text-[13px] font-semibold text-muted">{snapshot.nodes.length} concepts</span>
          </div>
        </header>

        <div className="mt-8">
          <ReducedMotion><TopicMap snapshot={snapshot} topicLinks={topicLinks} /></ReducedMotion>
        </div>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_340px] lg:gap-16">
          <div>
            {intro && (
              <section>
                <h2 className="text-[24px] font-extrabold tracking-[-0.03em] text-white">Overview</h2>
                <p className="mt-3 text-[17px] leading-[1.75] text-fg/85">{intro}</p>
                {root.wiki && (
                  <p className="mt-3 text-[13px] text-faint">
                    Source:{" "}
                    <a href={root.wiki.url} target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 underline-offset-4 hover:text-white">
                      Wikipedia — {root.wiki.title}
                    </a>{" "}
                    (CC BY-SA)
                  </p>
                )}
              </section>
            )}

            {concepts.length > 0 && (
              <section className="mt-12">
                <h2 className="text-[24px] font-extrabold tracking-[-0.03em] text-white">Key concepts</h2>
                <p className="mt-2 text-[15px] text-muted">How {name} connects to the ideas, people and events around it.</p>
                <ol className="mt-6 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                  {concepts.map((c) => {
                    const color = (CATEGORIES[c.category] ?? CATEGORIES.other).color;
                    const rel = relation(snapshot, root.id, c.id);
                    return (
                      <li key={c.id} className="py-5">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="h-2.5 w-2.5 shrink-0 translate-y-[-1px] self-center rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                          <h3 className="text-[18px] font-extrabold tracking-[-0.02em] text-white">
                            <Link href={conceptHref(c)} className="hover:text-purple-light">
                              {c.wiki?.title ?? c.title}
                            </Link>
                          </h3>
                          {rel && <span className="text-[13px] font-semibold text-faint">{rel}</span>}
                        </div>
                        {c.summary && <p className="mt-1.5 pl-[22px] text-[15.5px] leading-relaxed text-muted">{c.summary}</p>}
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            <ReducedMotion><TopicRevision snapshot={snapshot} slug={slug} /></ReducedMotion>

            <section className="mt-12">
              <h2 className="text-[24px] font-extrabold tracking-[-0.03em] text-white">Questions about {name}</h2>
              <div className="mt-4 border-t border-white/[0.08]">
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
            </section>
          </div>

          <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
            {exams.length > 0 && (
              <section>
                <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">Relevant for</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {exams.slice(0, 14).map((e) => (
                    <Link key={e.slug} href={`/exams/${e.slug}`} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[13px] font-semibold text-fg/90 transition hover:border-white/20 hover:text-white">
                      {e.short}
                    </Link>
                  ))}
                  {exams.length > 14 && (
                    <Link href="/exams" className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-faint hover:text-white">
                      +{exams.length - 14} more
                    </Link>
                  )}
                </div>
              </section>
            )}

            <InTheNews topic={topic.title} alt={name} />

            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-teal">Keep up on Gathered</h2>
              <p className="mt-2 text-[13.5px] text-muted">Daily current affairs and study material from our sister site.</p>
              <ul className="mt-3 divide-y divide-white/[0.06] border-y border-white/[0.06] text-[14.5px]">
                {isUpsc && (
                  <li>
                    <a href={GATHERED.upscStudyCards} target="_blank" rel="noopener" className="flex items-center justify-between gap-3 py-3 font-semibold text-fg/90 hover:text-white">
                      <span className="flex items-center gap-2.5"><BookOpen className="h-4 w-4 text-teal" /> UPSC current affairs study cards</span>
                      <ArrowUpRight className="h-4 w-4 text-faint" />
                    </a>
                  </li>
                )}
                {examGroups.map((g) => (
                  <li key={g}>
                    <a href={GATHERED.examCurrentAffairs(g)} target="_blank" rel="noopener" className="flex items-center justify-between gap-3 py-3 font-semibold text-fg/90 hover:text-white">
                      <span className="flex items-center gap-2.5"><Newspaper className="h-4 w-4 text-teal" /> {GATHERED_LABEL[g]} current affairs</span>
                      <ArrowUpRight className="h-4 w-4 text-faint" />
                    </a>
                  </li>
                ))}
                {isPolity && (
                  <li>
                    <Link href="/constitution" className="flex items-center justify-between gap-3 py-3 font-semibold text-fg/90 hover:text-white">
                      <span className="flex items-center gap-2.5"><BookOpen className="h-4 w-4 text-purple-light" /> Constitution of India map (Throvic)</span>
                      <ArrowRight className="h-4 w-4 text-faint" />
                    </Link>
                  </li>
                )}
                {isPolity && (
                  <li>
                    <a href={GATHERED.constitution} target="_blank" rel="noopener" className="flex items-center justify-between gap-3 py-3 font-semibold text-fg/90 hover:text-white">
                      <span className="flex items-center gap-2.5"><BookOpen className="h-4 w-4 text-teal" /> Constitution of India, article by article</span>
                      <ArrowUpRight className="h-4 w-4 text-faint" />
                    </a>
                  </li>
                )}
              </ul>
            </section>

            {related.length > 0 && (
              <section>
                <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-faint">More in {subject.name}</h2>
                <ul className="mt-3 space-y-1">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/topic/${r.slug}`} className="group flex items-center justify-between gap-3 rounded-xl px-2 py-2 text-[14.5px] font-semibold text-fg/85 transition hover:bg-white/[0.04] hover:text-white">
                        {r.title}
                        <ArrowRight className="h-4 w-4 text-faint opacity-0 transition group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </article>
      <div className="h-24" />
      <JsonLd data={learning} />
      <JsonLd data={faqJsonLd(faqs)} />
      {quiz && <JsonLd data={quiz} />}
    </PageShell>
  );
}
