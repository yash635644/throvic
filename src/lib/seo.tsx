import { absoluteUrl, SITE } from "./site";

/**
 * Structured data (JSON-LD). One connected @graph: the Throvic organisation, its website (with a
 * search box), the web app, and the founder — the same Person @id the portfolio and Gathered use,
 * so search engines and AI assistants understand all three belong together.
 */

const ORG_ID = absoluteUrl("/#organization");
const SITE_ID = absoluteUrl("/#website");
const APP_ID = absoluteUrl("/#app");
const LOGO = absoluteUrl("/icon-512.png");

const founder = {
  "@type": "Person",
  "@id": SITE.founder.id,
  name: SITE.founder.name,
  url: SITE.founder.url,
  jobTitle: SITE.founder.jobTitle,
  address: { "@type": "PostalAddress", addressLocality: SITE.founder.city, addressRegion: SITE.founder.region, addressCountry: SITE.founder.country },
  sameAs: [...SITE.founder.sameAs],
  knowsAbout: ["Knowledge graphs", "Search engine optimisation", "AI automation", "Web development"],
};

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE.name,
        url: absoluteUrl("/"),
        logo: { "@type": "ImageObject", url: LOGO, width: 512, height: 512 },
        slogan: SITE.tagline,
        description: SITE.description,
        founder: { "@id": SITE.founder.id },
        knowsAbout: ["Knowledge graphs", "Mind maps", "Concept maps", "Visual learning", "UPSC preparation", "Government exam preparation in India"],
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: absoluteUrl("/"),
        name: SITE.name,
        alternateName: "Throvic Knowledge Graph",
        description: SITE.description,
        inLanguage: SITE.language,
        publisher: { "@id": ORG_ID },
        creator: { "@id": SITE.founder.id },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: absoluteUrl("/explore?q={search_term_string}") },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebApplication",
        "@id": APP_ID,
        name: SITE.name,
        url: absoluteUrl("/explore"),
        description: "An interactive knowledge graph explorer: type a topic to see its key concepts and how they connect, with every concept verified on Wikipedia.",
        applicationCategory: "EducationalApplication",
        applicationSubCategory: "Mind mapping / knowledge graph",
        operatingSystem: "Any (web browser)",
        browserRequirements: "Requires JavaScript",
        inLanguage: SITE.language,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        image: absoluteUrl("/og/home.png"),
        screenshot: absoluteUrl("/og/explore.png"),
        featureList: [
          "Interactive knowledge graph for any topic",
          "Every concept verified against Wikipedia",
          "Expand concepts into branches; fold and unfold branches",
          "Web, radial and tree layouts plus an outline view",
          "Simple, standard and expert explanations",
          "Share images for social media, PDF study sheets and JSON data export",
          "Flashcards, quizzes and spaced-repetition revision with a daily streak",
          "Syllabus maps for UPSC, SSC, banking, railways, defence and state PSC exams",
          "Find in map, text outline, keyboard navigation and screen-reader support",
          "Installable app (PWA) that works offline for pages already opened",
        ],
        audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: "Students, exam aspirants, researchers and writers" },
        publisher: { "@id": ORG_ID },
        creator: { "@id": SITE.founder.id },
      },
      founder,
    ],
  };
}

/** The "How it works" steps as a HowTo (helps answer engines quote the steps). */
export function howToJsonLd(
  steps: { title: string; text: string }[],
  { name = "How to explore a topic as a knowledge graph with Throvic", description = "Turn any topic into an interactive map of related concepts in three steps.", path = "/" } = {},
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    totalTime: "PT1M",
    tool: [{ "@type": "HowToTool", name: "A web browser" }],
    step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text, url: absoluteUrl(`${path === "/" ? "" : path}#step-${i + 1}`) })),
  };
}

/** Popular topic maps as an ItemList. */
export function topicsJsonLd(topics: { title: string; hint: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Popular knowledge maps on Throvic",
    itemListElement: topics.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.title,
      description: t.hint,
      url: absoluteUrl(`/explore?q=${encodeURIComponent(t.title)}`),
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function JsonLd({ data }: { data: object }) {
  // "<" is escaped so the JSON can never close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.href) })),
  };
}

/** A page about the app itself (tool and hub pages), linked to the site's WebApplication entity. */
export function webPageJsonLd({ path, name, description, image, type = "WebPage" }: { path: string; name: string; description: string; image?: string; type?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": absoluteUrl(`${path}#webpage`),
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: SITE.language,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": APP_ID },
    publisher: { "@id": ORG_ID },
    ...(image ? { primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(image), width: 1200, height: 630 } } : {}),
  };
}
