import { ArrowUpRight } from "lucide-react";
import { ReducedMotion } from "@/components/ui/ReducedMotion";
import type { Metadata } from "next";
import { withShare } from "@/lib/share-cards";
import { FeedbackForm } from "@/components/landing/FeedbackForm";
import { Crumbs } from "@/components/site/Crumbs";
import { PageShell } from "@/components/site/PageShell";
import { JsonLd } from "@/lib/seo";
import { absoluteUrl, SITE } from "@/lib/site";

export const metadata: Metadata = withShare(
  {
    title: "Contact — Feedback, Bugs and Ideas",
    description: "Send feedback about Throvic: a topic that mapped badly, a bug, or an idea for a feature. Every message is read by the developer.",
    alternates: { canonical: "/contact" },
  },
  "contact",
);

export default function ContactPage() {
  const page = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Throvic",
    url: absoluteUrl("/contact"),
    isPartOf: { "@id": absoluteUrl("/#website") },
    about: { "@id": absoluteUrl("/#organization") },
  };
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <Crumbs items={[{ name: "Home", href: "/" }, { name: "Contact", href: "/contact" }]} />
        <div className="mt-6 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <header>
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">Contact</p>
            <h1 className="mt-2 text-[36px] font-extrabold leading-[1.08] tracking-[-0.04em] text-white sm:text-[48px]">Say hello.</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">A topic that mapped badly, a bug, an idea for a feature, or a partnership for students — every message is read by the developer.</p>
            <ul className="mt-8 divide-y divide-white/[0.07] border-y border-white/[0.07] text-[15px]">
              <li className="py-3.5">
                <span className="block text-[13px] font-semibold text-faint">Reporting a wrong fact?</span>
                <span className="text-fg/90">Include the topic and the concept, so it can be checked quickly.</span>
              </li>
              <li>
                <a href={SITE.founder.url} target="_blank" rel="noopener" className="flex items-center justify-between py-3.5 font-semibold text-fg/90 hover:text-white">
                  {SITE.founder.name} — portfolio <ArrowUpRight className="h-4 w-4 text-faint" />
                </a>
              </li>
              <li>
                <a href={SITE.gathered.url} target="_blank" rel="noopener" className="flex items-center justify-between py-3.5 font-semibold text-fg/90 hover:text-white">
                  Gathered — our sister site <ArrowUpRight className="h-4 w-4 text-faint" />
                </a>
              </li>
            </ul>
          </header>
          <div>
            <ReducedMotion><FeedbackForm /></ReducedMotion>
          </div>
        </div>
      </div>
      <div className="h-24" />
      <JsonLd data={page} />
    </PageShell>
  );
}
