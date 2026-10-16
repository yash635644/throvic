import type { Metadata } from "next";
import { withShare } from "@/lib/share-cards";
import Link from "@/components/ui/Link";
import { ProsePage } from "@/components/site/Prose";
import { MORE_FAQS } from "@/lib/faq";
import { faqJsonLd, JsonLd } from "@/lib/seo";
import { absoluteUrl, SITE } from "@/lib/site";

export const metadata: Metadata = withShare(
  {
    title: "About Throvic — How It Works and Who Made It",
    description: "Throvic turns any topic into an interactive knowledge graph verified on Wikipedia. Learn how it works, how accuracy is handled, and who built it.",
    alternates: { canonical: "/about" },
  },
  "about",
);

export default function AboutPage() {
  const about = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Throvic",
    url: absoluteUrl("/about"),
    isPartOf: { "@id": absoluteUrl("/#website") },
    about: { "@id": absoluteUrl("/#organization") },
    mainEntity: { "@id": SITE.founder.id },
  };
  return (
    <ProsePage
      eyebrow="About"
      title="The thrill of knowing more."
      intro="Throvic is a free knowledge graph explorer. Type any topic and it maps the ideas, people, places and events around it — and how they connect — so you can understand a subject, not just look it up."
      crumb={{ name: "About", href: "/about" }}
    >
      <h2>Why a map?</h2>
      <p>
        A search result gives you a list of pages about one thing. Real understanding comes from context: what caused something, who shaped it, what it led to. Throvic shows that context on one screen, and lets you
        expand any part of it as far as your curiosity goes.
      </p>

      <h2>How it works</h2>
      <ul>
        <li>
          <strong>AI suggests the connections.</strong> When you search a topic, an AI model proposes its most important related concepts and a short label for each relationship, such as “discovered by” or “part
          of”.
        </li>
        <li>
          <strong>Wikipedia verifies the concepts.</strong> Every concept is matched to its English Wikipedia article, which supplies the photo, summary and source link. Concepts without a matching article are
          clearly marked.
        </li>
        <li>
          <strong>Maps are shared and cached.</strong> Once a topic has been mapped, it opens instantly for everyone, which keeps Throvic fast and free.
        </li>
      </ul>

      <h2>Accuracy</h2>
      <p>
        Concept details come from Wikipedia, but relationship labels and short summaries are written by AI and can occasionally be wrong. Treat a map as a starting point and follow the source links for detail or
        citations. If something looks wrong, please <Link href="/contact">tell us</Link> — reports are read and fixed.
      </p>
      <p>
        Exam pages list exam names and conducting bodies only. Dates, eligibility and syllabus details change every cycle, so always check the official notification.
      </p>

      <h2>Who made Throvic</h2>
      <p>
        Throvic is designed and developed by <a href={SITE.founder.url}>{SITE.founder.name}</a>, an {SITE.founder.jobTitle.toLowerCase()} from {SITE.founder.city}, {SITE.founder.region}. It is an independent
        project.
      </p>
      <p>
        Throvic has a sister site, <a href={SITE.gathered.url}>{SITE.gathered.name}</a> — daily news, current affairs for exam aspirants, UPSC study cards and the Constitution of India explained. Use Gathered to stay
        current and Throvic to understand how a topic connects.
      </p>

      <h2>Get in touch</h2>
      <p>
        Ideas, bugs and topics that mapped badly are all welcome on the <Link href="/contact">contact page</Link>. See also the <Link href="/privacy">privacy policy</Link> and <Link href="/terms">terms of use</Link>.
      </p>
      <h2>More questions</h2>
      {MORE_FAQS.map((f) => (
        <div key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
      <JsonLd data={about} />
      <JsonLd data={faqJsonLd(MORE_FAQS)} />
    </ProsePage>
  );
}
