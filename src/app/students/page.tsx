import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Landmark, ListChecks, Newspaper, PenLine, Repeat, Waypoints } from "lucide-react";
import type { Metadata } from "next";
import { withShare } from "@/lib/share-cards";
import Link from "@/components/ui/Link";
import { FeatureGrid, OtherAudiences } from "@/components/site/AudienceParts";
import { ConceptOfDay } from "@/components/site/ConceptOfDay";
import { Crumbs } from "@/components/site/Crumbs";
import { StudyDashboard } from "@/components/site/StudyDashboard";
import { audienceBySlug } from "@/lib/audiences";
import { PageShell } from "@/components/site/PageShell";
import { ALL_TOPICS } from "@/lib/catalog";
import { CENTRAL_EXAMS, EXAMS, GATHERED, GROUPS, STATES, type ExamGroup } from "@/lib/exams";
import { slugify } from "@/lib/keys";
import { JsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { SUBJECTS, topicHref } from "@/lib/syllabus";

export const metadata: Metadata = withShare(
  {
    title: "For Students & Exam Aspirants — Syllabus as Knowledge Maps",
    description:
      "Study UPSC, SSC, banking, railways, defence and state PSC syllabus topics as interactive knowledge maps, verified on Wikipedia — with daily current affairs on Gathered.",
    alternates: { canonical: "/students" },
  },
  "students",
);

const CENTRAL_ORDER: ExamGroup[] = ["civil-services", "ssc", "banking", "insurance", "railways", "defence"];

const USES = [
  { Icon: Repeat, title: "Revise faster", text: "See a whole topic — causes, people, events, outcomes — on one screen, then expand only what you need." },
  { Icon: PenLine, title: "Write better answers", text: "Map the dimensions of a topic before an essay or Mains answer, so nothing important is missed." },
  { Icon: Waypoints, title: "Link news to the syllabus", text: "Read today's current affairs on Gathered, then open the static topic behind it here." },
];

const POPULAR = ["Indus Valley Civilisation", "Mughal Empire", "Quit India Movement", "Fundamental rights in India", "Directive Principles of State Policy", "Monsoon", "Western Ghats", "Reserve Bank of India", "Goods and Services Tax (India)", "Paris Agreement", "Indian Space Research Organisation", "BRICS"];

export default function StudentsPage() {
  const page = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Throvic for students and exam aspirants",
    url: absoluteUrl("/students"),
    description: metadata.description,
    isPartOf: { "@id": absoluteUrl("/#website") },
    audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: "Government exam aspirants (UPSC, SSC, banking, railways, defence, state PSC)" },
    hasPart: [
      { "@type": "CollectionPage", name: "Government exams", url: absoluteUrl("/exams") },
      { "@type": "CollectionPage", name: "Subjects", url: absoluteUrl("/subjects") },
    ],
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <Crumbs items={[{ name: "Home", href: "/" }, { name: "For students", href: "/students" }]} />

        <header className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">For students & aspirants</p>
            <h1 className="mt-2 text-[38px] font-extrabold leading-[1.05] tracking-[-0.04em] text-white sm:text-[58px]">
              Learn the syllabus <span className="text-brand whitespace-nowrap pb-[0.08em] sm:block">as a map.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">
              Knowledge maps for {EXAMS.length} central and state government exams — {ALL_TOPICS.length} syllabus topics across {SUBJECTS.length} subjects, each verified on Wikipedia. Pair them with daily current affairs on Gathered.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            {[
              [EXAMS.length, "exams"],
              [SUBJECTS.length, "subjects"],
              [ALL_TOPICS.length, "topic maps"],
            ].map(([n, l]) => (
              <div key={l as string}>
                <dt className="text-[13px] font-semibold text-faint">{l}</dt>
                <dd className="mt-1 text-[30px] font-extrabold tracking-[-0.03em] text-white">{n}</dd>
              </div>
            ))}
          </dl>
        </header>

        <StudyDashboard />
        <ConceptOfDay className="mt-6" />

        {/* How students use it */}
        <ol className="mt-16 grid gap-8 border-y border-white/[0.07] py-10 sm:grid-cols-3">
          {USES.map(({ Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
              <div>
                <h2 className="text-[17px] font-extrabold text-white">{title}</h2>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>

        <FeatureGrid audience={audienceBySlug("students")} heading="Built for exam preparation" />

        {/* Choose your exam */}
        <section className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">Step 1</p>
              <h2 className="mt-2 text-[30px] font-extrabold tracking-[-0.035em] text-white sm:text-[38px]">Choose your exam</h2>
            </div>
            <Link href="/exams" className="inline-flex items-center gap-1.5 text-[14.5px] font-bold text-purple-light hover:underline">
              All {EXAMS.length} exams <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-12 lg:grid-cols-2">
            <div>
              <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-faint">Central exams</h3>
              <ul className="mt-3 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {CENTRAL_ORDER.map((g) => (
                  <li key={g}>
                    <Link href={`/exams#${g}`} className="group flex items-center justify-between gap-6 py-4">
                      <span>
                        <span className="block text-[17px] font-extrabold text-white group-hover:text-purple-light">{GROUPS[g].label}</span>
                        <span className="block text-[13.5px] text-faint">
                          {CENTRAL_EXAMS.filter((e) => e.group === g)
                            .map((e) => e.short)
                            .join(" · ")}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-white" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-faint">State exams — PSC & staff selection boards</h3>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {STATES.map((s) => (
                  <Link key={s} href={`/exams#${slugify(s)}`} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-[14px] font-semibold text-fg/90 transition hover:border-purple/40 hover:bg-purple/10 hover:text-white">
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Study by subject */}
        <section className="mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">Step 2</p>
              <h2 className="mt-2 text-[30px] font-extrabold tracking-[-0.035em] text-white sm:text-[38px]">Study by subject</h2>
            </div>
            <Link href="/subjects" className="inline-flex items-center gap-1.5 text-[14.5px] font-bold text-purple-light hover:underline">
              All subjects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-8 grid gap-x-10 border-t border-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
            {SUBJECTS.map((s) => (
              <li key={s.slug} className="border-b border-white/[0.07]">
                <Link href={`/subjects/${s.slug}`} className="group flex items-center justify-between gap-4 py-4">
                  <span className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />
                    <span className="text-[16px] font-bold text-white group-hover:text-purple-light">{s.name}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-white" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Popular topics */}
        <section className="mt-24">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">Step 3</p>
          <h2 className="mt-2 text-[30px] font-extrabold tracking-[-0.035em] text-white sm:text-[38px]">Open a topic map</h2>
          <Link href="/constitution" className="group mt-6 flex items-center justify-between gap-6 border-y border-white/[0.08] py-5">
            <span>
              <span className="block text-[13px] font-bold uppercase tracking-[0.14em] text-amber">New · Indian Polity</span>
              <span className="mt-1 block text-[22px] font-extrabold tracking-[-0.02em] text-white group-hover:text-purple-light">Constitution of India map</span>
              <span className="mt-0.5 block text-[15px] text-muted">All 25 Parts, 12 Schedules and key articles in one interactive map — linked to the full text.</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-faint transition group-hover:translate-x-1 group-hover:text-white" />
          </Link>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {POPULAR.map((t) => (
              <Link key={t} href={topicHref(t)} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[15px] font-semibold text-white/90 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] hover:text-white">
                {t}
              </Link>
            ))}
          </div>
        </section>

        {/* Gathered */}
        <section className="mt-24 grid gap-10 border-t border-white/[0.07] pt-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-teal">Daily practice</p>
            <h2 className="mt-2 text-[30px] font-extrabold tracking-[-0.035em] text-white sm:text-[38px]">Stay current on Gathered</h2>
            <p className="mt-3 max-w-md text-[16px] leading-relaxed text-muted">Our sister site publishes daily current affairs by exam, UPSC study cards, the Constitution explained and daily quizzes.</p>
          </div>
          <ul className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {[
              { href: GATHERED.todayCurrentAffairs, label: "Today's current affairs", Icon: Newspaper },
              { href: GATHERED.upscStudyCards, label: "UPSC current affairs study cards", Icon: BookOpen },
              { href: GATHERED.mainsQuestions, label: "UPSC Mains question bank", Icon: PenLine },
              { href: GATHERED.constitution, label: "Constitution of India, article by article", Icon: Landmark },
              { href: GATHERED.quiz, label: "Daily current affairs quiz", Icon: ListChecks },
              { href: GATHERED.importantDays, label: "Important days", Icon: CalendarDays },
            ].map(({ href, label, Icon }) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener" className="group flex items-center justify-between gap-4 py-3.5 text-[15.5px] font-semibold text-fg/90 hover:text-white">
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-teal" /> {label}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-faint transition group-hover:text-white" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <OtherAudiences current="students" />
      </div>
      <div className="h-24" />
      <JsonLd data={page} />
    </PageShell>
  );
}
