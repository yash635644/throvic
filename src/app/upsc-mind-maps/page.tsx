import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { Crumbs } from "@/components/site/Crumbs";
import { PageShell } from "@/components/site/PageShell";
import { FaqList, SectionTitle } from "@/components/site/SeoParts";
import { examBySlug, GATHERED } from "@/lib/exams";
import { faqJsonLd, JsonLd, webPageJsonLd } from "@/lib/seo";
import { withShare } from "@/lib/share-cards";
import { absoluteUrl } from "@/lib/site";
import { subjectBySlug, topicHref } from "@/lib/syllabus";

const PATH = "/upsc-mind-maps";
const TITLE = "UPSC Mind Maps — Topic-wise, Free & Interactive";
const DESCRIPTION =
  "Free topic-wise UPSC mind maps for the GS syllabus — history, polity, geography, economy, environment and more — with flashcards and quizzes.";

export const metadata: Metadata = withShare({ title: TITLE, description: DESCRIPTION, alternates: { canonical: PATH } }, "upsc-mind-maps");

const TIPS = [
  { title: "Start with the map, then the details", text: "Open a topic's map before reading the chapter. Knowing its parts, causes and people first makes the notes easier to place and remember." },
  { title: "Link static topics to the news", text: "Mains questions often join a syllabus topic to a current issue. Use a topic's connections to see where today's headline fits in." },
  { title: "Revise on a schedule", text: "Mark a topic revised after its quiz. Throvic brings it back after 1, 3, 7, 14 and 30 days, and keeps a daily streak on your device." },
  { title: "Expand where you're weak", text: "If a concept on the map is unfamiliar, expand it. It becomes its own branch with a summary and a source to read." },
];

const FAQS = [
  { q: "Are these UPSC mind maps free?", a: "Yes. Every map, flashcard set and quiz on Throvic is free, with no sign-up." },
  { q: "Are they PDFs?", a: "They are interactive maps you can zoom, tap and expand. Any map can be downloaded as a PDF (the map plus a summary of every concept) or as an image for your notes." },
  { q: "Which UPSC subjects are covered?", a: "The general studies syllabus: ancient, medieval and modern Indian history, art and culture, Indian and world geography, polity and the Constitution, economy, environment and ecology, science and technology, and international relations." },
  { q: "Do the maps cover current affairs?", a: "The maps cover the static syllabus. For daily current affairs, UPSC study cards and a mains question bank, use our sister site Gathered, linked on every topic page." },
  { q: "How accurate are the maps?", a: "Concepts and their connections are suggested by AI, and every concept is matched to its Wikipedia article with a summary and source link. Always confirm facts against your standard books before the exam." },
  { q: "Can I use them for state PSC exams?", a: "Yes. The same topics serve state PSC exams, and each state also has its own history, geography, culture, economy and politics topics. See the government exams page for your state." },
];

export default function UpscMindMapsPage() {
  const exam = examBySlug("upsc-civil-services")!;
  const subjects = exam.subjects.filter((s) => s !== "state-studies").map((s) => subjectBySlug(s)!);
  const total = subjects.reduce((n, s) => n + s.topics.length, 0);

  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "UPSC mind maps by subject",
    numberOfItems: total,
    itemListElement: subjects.flatMap((s) => s.topics).map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t, url: absoluteUrl(topicHref(t)) })),
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Crumbs items={[{ name: "Home", href: "/" }, { name: "For students", href: "/students" }, { name: "UPSC mind maps", href: PATH }]} />

        <header className="rise mt-6 max-w-3xl">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-teal">UPSC CSE · General studies</p>
          <h1 className="mt-2 text-[38px] font-extrabold leading-[1.05] tracking-[-0.045em] text-white sm:text-[56px]">
            UPSC mind maps, <span className="text-brand">topic-wise.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-[18px]">
            {total} syllabus topics across {subjects.length} subjects, each as an interactive mind map you can expand — with a Wikipedia-verified summary for every concept, flashcards and a 5-question quiz.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/exams/upsc-civil-services" className="bg-brand inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14.5px] font-bold text-white shadow-glow">
              UPSC CSE syllabus page <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/constitution" className="inline-flex h-11 items-center rounded-full border border-white/10 bg-white/[0.04] px-5 text-[14.5px] font-semibold text-white hover:bg-white/[0.08]">
              Constitution of India map
            </Link>
          </div>
        </header>

        <nav aria-label="Subjects on this page" className="mt-12 flex flex-wrap gap-1.5 border-y border-white/[0.07] py-4">
          {subjects.map((s) => (
            <a key={s.slug} href={`#${s.slug}`} className="rounded-full px-3 py-1.5 text-[13.5px] font-semibold text-muted hover:bg-white/[0.06] hover:text-white">
              {s.name} <span className="text-faint">· {s.topics.length}</span>
            </a>
          ))}
        </nav>

        <div className="mt-10 space-y-12">
          {subjects.map((s) => (
            <section key={s.slug} id={s.slug} className="scroll-mt-28" aria-labelledby={`${s.slug}-h`}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 id={`${s.slug}-h`} className="text-[22px] font-extrabold tracking-[-0.03em] text-white sm:text-[24px]">
                  <span className="mr-2.5 inline-block h-2.5 w-2.5 -translate-y-0.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} aria-hidden />
                  {s.name} mind maps
                </h2>
                <Link href={`/subjects/${s.slug}`} className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-purple-light hover:underline">
                  Subject overview <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <p className="mt-1.5 text-[15px] text-muted">{s.blurb}</p>
              <ul className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                {s.topics.map((t) => (
                  <li key={t}>
                    <Link href={topicHref(t)} className="group flex min-h-11 items-center justify-between gap-3 border-b border-white/[0.06] py-2 text-[15px] font-semibold text-fg/90 hover:text-white">
                      {t} mind map
                      <ArrowRight className="h-4 w-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-white" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-20" aria-labelledby="tips">
          <SectionTitle id="tips" eyebrow="Study method">
            How to use mind maps for UPSC prelims and mains
          </SectionTitle>
          <ol className="mt-6 grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {TIPS.map((t, i) => (
              <li key={t.title} className="reveal flex gap-4">
                <span className="text-brand text-[22px] font-extrabold tabular-nums">{i + 1}</span>
                <div>
                  <h3 className="text-[17.5px] font-extrabold tracking-[-0.02em] text-white">{t.title}</h3>
                  <p className="mt-1.5 text-[15.5px] leading-relaxed text-muted">{t.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/students#your-study" className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[14.5px] font-semibold text-white hover:bg-white/[0.08]">
              Track my UPSC revision <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={GATHERED.examCurrentAffairs("upsc")} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[14.5px] font-semibold text-white hover:bg-white/[0.08]">
              UPSC current affairs on Gathered <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="my-20 max-w-3xl" aria-labelledby="faq">
          <SectionTitle id="faq" eyebrow="FAQ">
            UPSC mind maps — common questions
          </SectionTitle>
          <FaqList faqs={FAQS} />
        </section>
      </div>
      <JsonLd data={webPageJsonLd({ path: PATH, name: TITLE, description: DESCRIPTION, image: "/og/upsc-mind-maps.png", type: "CollectionPage" })} />
      <JsonLd data={list} />
      <JsonLd data={faqJsonLd(FAQS)} />
    </PageShell>
  );
}
