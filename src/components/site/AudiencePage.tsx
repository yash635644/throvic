import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { withShare } from "@/lib/share-cards";
import Link from "@/components/ui/Link";
import { isTopic } from "@/lib/catalog";
import { audienceBySlug, type AudienceSlug } from "@/lib/audiences";
import { JsonLd } from "@/lib/seo";
import { absoluteUrl, exploreUrl } from "@/lib/site";
import { topicHref } from "@/lib/syllabus";
import { FeatureGrid, OtherAudiences } from "./AudienceParts";
import { Crumbs } from "./Crumbs";
import { PageShell } from "./PageShell";

export function audienceMetadata(slug: AudienceSlug): Metadata {
  const a = audienceBySlug(slug);
  return withShare({ title: a.title, description: a.description, alternates: { canonical: `/${slug}` } }, slug);
}

/** Shared layout for the Researchers, Creators and Curious pages. */
export function AudiencePage({ slug }: { slug: AudienceSlug }) {
  const a = audienceBySlug(slug);
  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: a.title,
    url: absoluteUrl(`/${slug}`),
    description: a.description,
    isPartOf: { "@id": absoluteUrl("/#website") },
    about: { "@id": absoluteUrl("/#app") },
    audience: { "@type": "Audience", audienceType: a.label },
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <Crumbs items={[{ name: "Home", href: "/" }, { name: `For ${a.label.toLowerCase()}`, href: `/${slug}` }]} />

        <header className="mt-6 max-w-4xl">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: a.color }}>
            {a.eyebrow}
          </p>
          <h1 className="mt-2 text-[38px] font-extrabold leading-[1.05] tracking-[-0.04em] text-white sm:text-[58px]">
            {a.headline} <span className="text-brand pb-[0.08em] sm:block">{a.headlineAccent}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted">{a.intro}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={exploreUrl(a.starters[0])} className="bg-brand inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-bold text-white shadow-glow transition hover:brightness-110">
              Try it with {a.starters[0]} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/explore" className="inline-flex h-12 items-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-[15px] font-semibold text-white transition hover:bg-white/[0.08]">
              Search your own topic
            </Link>
          </div>
        </header>

        {/* Ways to use it */}
        <ol className="mt-16 grid gap-8 border-y border-white/[0.07] py-10 sm:grid-cols-3">
          {a.uses.map((u, i) => (
            <li key={u.title} className="flex gap-4">
              <span className="text-[14px] font-extrabold tabular-nums" style={{ color: a.color }}>
                0{i + 1}
              </span>
              <div>
                <h2 className="text-[17px] font-extrabold text-white">{u.title}</h2>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{u.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <FeatureGrid audience={a} />

        {/* Workflow */}
        <section className="mt-24 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: a.color }}>
              How it fits your work
            </p>
            <h2 className="mt-2 text-[30px] font-extrabold tracking-[-0.035em] text-white sm:text-[38px]">Three steps, a few minutes.</h2>
          </div>
          <ol className="relative">
            <span className="absolute bottom-6 left-[19px] top-6 w-px bg-gradient-to-b from-purple via-[#6fa2c6] to-teal opacity-50" aria-hidden />
            {a.workflow.map((s, i) => (
              <li key={s.title} className="relative flex gap-6 pb-8 last:pb-0">
                <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0d0d14] text-[14px] font-extrabold text-white ring-2 ring-purple/60">{i + 1}</span>
                <div className="pt-1.5">
                  <h3 className="text-[19px] font-extrabold tracking-[-0.02em] text-white">{s.title}</h3>
                  <p className="mt-1 text-[15.5px] leading-relaxed text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Starter maps */}
        <section className="mt-24">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: a.color }}>
            Try these
          </p>
          <h2 className="mt-2 text-[30px] font-extrabold tracking-[-0.035em] text-white sm:text-[38px]">Start with a map</h2>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {a.starters.map((t) => (
              <Link
                key={t}
                href={isTopic(t) ? topicHref(t) : exploreUrl(t)}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[15px] font-semibold text-white/90 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                {t}
              </Link>
            ))}
          </div>
        </section>

        <OtherAudiences current={slug} />
      </div>
      <div className="h-24" />
      <JsonLd data={page} />
    </PageShell>
  );
}
