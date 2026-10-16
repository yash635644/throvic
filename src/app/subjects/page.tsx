import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { withShare } from "@/lib/share-cards";
import Link from "@/components/ui/Link";
import { Crumbs } from "@/components/site/Crumbs";
import { PageShell } from "@/components/site/PageShell";
import { ALL_TOPICS } from "@/lib/catalog";
import { examsWithSubject } from "@/lib/exams";
import { SUBJECTS } from "@/lib/syllabus";

export const metadata: Metadata = withShare(
  {
    title: "Subjects — History, Polity, Geography, Economy & More",
    description:
      "General studies subjects for government exams as interactive knowledge maps: history, art and culture, geography, polity, economy, environment, science, international relations and state studies.",
    alternates: { canonical: "/subjects" },
  },
  "subjects",
);

export default function SubjectsPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <Crumbs items={[{ name: "Home", href: "/" }, { name: "For students", href: "/students" }, { name: "Subjects", href: "/subjects" }]} />
        <header className="mt-6 max-w-3xl">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">Subjects</p>
          <h1 className="mt-2 text-[36px] font-extrabold leading-[1.08] tracking-[-0.04em] text-white sm:text-[52px]">
            The syllabus, <span className="text-brand">as connected maps.</span>
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            {ALL_TOPICS.length} topics across {SUBJECTS.length} subjects, each one a verified knowledge map you can explore.
          </p>
        </header>
        <ul className="mt-14 grid border-t border-white/[0.07] sm:grid-cols-2">
          {SUBJECTS.map((s, i) => {
            const count = s.slug === "state-studies" ? ALL_TOPICS.filter((t) => t.subject === "state-studies").length : s.topics.length;
            return (
              <li key={s.slug} className={`border-b border-white/[0.07] ${i % 2 === 1 ? "sm:border-l sm:pl-8" : "sm:pr-8"}`}>
                <Link href={`/subjects/${s.slug}`} className="group flex items-start justify-between gap-6 py-7">
                  <span>
                    <span className="flex items-center gap-2.5 text-[20px] font-extrabold tracking-[-0.02em] text-white group-hover:text-purple-light">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />
                      {s.name}
                    </span>
                    <span className="mt-1.5 block text-[14.5px] leading-relaxed text-muted">{s.blurb}</span>
                    <span className="mt-2 block text-[13px] font-semibold text-faint">
                      {count} topics · {examsWithSubject(s.slug).length} exams
                    </span>
                  </span>
                  <ArrowRight className="mt-2 h-5 w-5 shrink-0 text-faint transition group-hover:translate-x-1 group-hover:text-white" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="h-24" />
    </PageShell>
  );
}
