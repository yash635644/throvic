import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, ListChecks, Newspaper } from "lucide-react";
import type { Metadata } from "next";
import { withShare } from "@/lib/share-cards";
import Link from "@/components/ui/Link";
import { notFound } from "next/navigation";
import { Crumbs } from "@/components/site/Crumbs";
import { PageShell } from "@/components/site/PageShell";
import { MyExamButton } from "@/components/site/StudyDashboard";
import { topicsOfState } from "@/lib/catalog";
import { EXAMS, examBySlug, GATHERED, GATHERED_LABEL, GROUPS } from "@/lib/exams";
import { JsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { subjectBySlug, topicHref } from "@/lib/syllabus";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return EXAMS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exam = examBySlug(slug);
  if (!exam) return {};
  const subjects = exam.subjects.map((s) => subjectBySlug(s)!.name);
  return withShare(
    {
      title: `${exam.short} Syllabus Mind Maps — Free Topic-wise Preparation`,
      description: `Free ${exam.short} mind maps, flashcards and quizzes, topic by topic: ${subjects.slice(0, 3).join(", ")} and more${exam.state ? `, plus ${exam.state} state studies` : ""}.`,
      alternates: { canonical: `/exams/${slug}` },
    },
    `exam-${slug}`,
  );
}

export default async function ExamPage({ params }: Props) {
  const { slug } = await params;
  const exam = examBySlug(slug);
  if (!exam) notFound();
  const subjects = exam.subjects.map((s) => subjectBySlug(s)!).filter((s) => s.slug !== "state-studies");
  const stateTopics = exam.state ? topicsOfState(exam.state) : [];
  const gathered = [
    { href: GATHERED.examCurrentAffairs(exam.gathered), label: `${GATHERED_LABEL[exam.gathered]} current affairs`, Icon: Newspaper },
    ...(exam.gathered === "upsc" ? [{ href: GATHERED.upscStudyCards, label: "UPSC study cards", Icon: BookOpen }, { href: GATHERED.mainsQuestions, label: "Mains question bank", Icon: ListChecks }] : []),
    { href: GATHERED.constitution, label: "Constitution of India", Icon: BookOpen },
    { href: GATHERED.quiz, label: "Daily current affairs quiz", Icon: ListChecks },
    { href: GATHERED.importantDays, label: "Important days", Icon: CalendarDays },
  ];

  const page = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${exam.short} preparation — knowledge maps`,
    url: absoluteUrl(`/exams/${slug}`),
    about: { "@type": "Thing", name: exam.name },
    audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: `${exam.short} aspirants` },
    isPartOf: { "@id": absoluteUrl("/#website") },
    hasPart: subjects.map((s) => ({ "@type": "CollectionPage", name: s.name, url: absoluteUrl(`/subjects/${s.slug}`) })),
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <Crumbs items={[{ name: "Home", href: "/" }, { name: "For students", href: "/students" }, { name: "Exams", href: "/exams" }, { name: exam.short, href: `/exams/${slug}` }]} />

        <header className="mt-6 max-w-3xl">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">
            {exam.level === "central" ? "Central exam" : `State exam · ${exam.state}`} · {GROUPS[exam.group].label}
          </p>
          <h1 className="mt-2 text-[34px] font-extrabold leading-[1.08] tracking-[-0.04em] text-white sm:text-[48px]">{exam.short} preparation</h1>
          <p className="mt-3 text-[17px] text-muted">
            {exam.name} · conducted by {exam.body}
          </p>
          <p className="mt-5 text-[16.5px] leading-relaxed text-fg/85">
            Below are the general studies and general awareness subjects that {exam.short} draws on, each broken into topics you can open as interactive knowledge maps — so you see how people, events and ideas connect instead of memorising them in isolation.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <MyExamButton slug={exam.slug} short={exam.short} />
            <span className="text-[13.5px] text-faint">Track your revision progress on the For students page.</span>
          </div>
        </header>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div className="space-y-12">
            {exam.state && stateTopics.length > 0 && (
              <section>
                <h2 className="text-[22px] font-extrabold tracking-[-0.03em] text-white">{exam.state} state studies</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {stateTopics.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/topic/${t.slug}`} className="inline-flex rounded-full border border-white/[0.1] bg-purple/10 px-4 py-2 text-[14.5px] font-semibold text-white transition hover:border-purple/50">
                        {t.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {subjects.map((s) => (
              <section key={s.slug} className="border-t border-white/[0.07] pt-8">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-[22px] font-extrabold tracking-[-0.03em] text-white">
                    <span className="mr-2.5 inline-block h-2.5 w-2.5 -translate-y-0.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />
                    {s.name}
                  </h2>
                  <Link href={`/subjects/${s.slug}`} className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-purple-light hover:underline">
                    Subject overview <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <p className="mt-1.5 text-[14.5px] text-muted">{s.blurb}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {s.topics.map((t) => (
                    <li key={t}>
                      <Link href={topicHref(t)} className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[13.5px] font-medium text-fg/90 transition hover:border-white/25 hover:text-white">
                        {t}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-teal">Daily practice on Gathered</h2>
            <p className="mt-2 text-[13.5px] text-muted">Current affairs and study material from our sister site.</p>
            <ul className="mt-3 divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {gathered.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener" className="flex items-center justify-between gap-3 py-3 text-[14.5px] font-semibold text-fg/90 hover:text-white">
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-teal" /> {label}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-faint" />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
      <div className="h-24" />
      <JsonLd data={page} />
    </PageShell>
  );
}
