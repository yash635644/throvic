import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { Crumbs } from "@/components/site/Crumbs";
import { PageShell } from "@/components/site/PageShell";
import { FaqList, StartForm } from "@/components/site/SeoParts";
import { faqJsonLd, JsonLd } from "@/lib/seo";
import { withShare } from "@/lib/share-cards";
import { absoluteUrl, SITE } from "@/lib/site";

const PATH = "/guides/knowledge-graph-vs-mind-map";
const TITLE = "Knowledge Graph vs Mind Map vs Concept Map";
const DESCRIPTION =
  "Mind maps branch from one idea, concept maps label the links, knowledge graphs connect entities in a network. A comparison table and which to use for studying.";
const PUBLISHED = "2026-10-16";

export const metadata: Metadata = {
  ...withShare({ title: TITLE, description: DESCRIPTION, alternates: { canonical: PATH } }, "guide-kg-vs-mind-map"),
  authors: [{ name: SITE.founder.name, url: SITE.founder.url }],
};

const ROWS: [string, string, string, string][] = [
  ["Shape", "A tree: one central idea with branches", "A network, usually with a main idea at the top", "A network with no fixed centre"],
  ["Links", "Unlabelled branches", "Labelled with linking phrases (“causes”, “requires”)", "Typed relationships (“born in”, “part of”)"],
  ["Cross-links between branches", "Rare", "Encouraged — they show deeper understanding", "Normal — any node can link to any other"],
  ["Who reads it", "People", "People", "People and software"],
  ["Size", "One page", "One page to a few pages", "From a handful of nodes to billions"],
  ["Best for", "Brainstorming, note-taking, quick overviews", "Explaining how ideas relate; testing understanding", "Exploring a whole subject; search, data and AI systems"],
  ["Origin", "Popularised by Tony Buzan in the 1970s", "Developed by Joseph Novak's team at Cornell in the 1970s", "Term popularised by Google's Knowledge Graph in 2012"],
];

const FAQS = [
  { q: "What is the main difference between a mind map and a knowledge graph?", a: "A mind map is a tree that branches out from one central idea, and its branches are usually unlabelled. A knowledge graph is a network where any concept can connect to any other and every connection has a defined meaning." },
  { q: "Is a concept map the same as a mind map?", a: "No. A concept map labels every link with a linking phrase so that two concepts and their link read as a statement (“photosynthesis — produces — oxygen”), and it often links across branches. A mind map usually has neither." },
  { q: "Which is best for studying?", a: "Use a mind map to collect what you know quickly, a concept map to check you understand how ideas relate, and a knowledge graph to explore a subject you don't know yet — it shows the important concepts and their relationships before you read the details." },
  { q: "Can a mind map become a knowledge graph?", a: "Yes — add labels to the links and connect concepts across branches. Throvic works this way: a new map starts as a topic with its main concepts, and expanding concepts turns it into a growing knowledge graph." },
  { q: "Are knowledge graphs only for computers?", a: "No. Large knowledge graphs such as Wikidata are built for software, but small knowledge graphs about one topic are a very readable way for people to see how a subject fits together." },
];

export default function GuidePage() {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": absoluteUrl(`${PATH}#article`),
    headline: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    image: absoluteUrl("/og/guide-kg-vs-mind-map.png"),
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    inLanguage: SITE.language,
    author: { "@id": SITE.founder.id, "@type": "Person", name: SITE.founder.name, url: SITE.founder.url },
    publisher: { "@id": absoluteUrl("/#organization") },
    isPartOf: { "@id": absoluteUrl("/#website") },
    about: [
      { "@type": "Thing", name: "Knowledge graph", sameAs: "https://en.wikipedia.org/wiki/Knowledge_graph" },
      { "@type": "Thing", name: "Mind map", sameAs: "https://en.wikipedia.org/wiki/Mind_map" },
      { "@type": "Thing", name: "Concept map", sameAs: "https://en.wikipedia.org/wiki/Concept_map" },
    ],
  };

  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-5 sm:px-6">
        <Crumbs items={[{ name: "Home", href: "/" }, { name: "Knowledge graph vs mind map", href: PATH }]} />

        <header className="rise mt-6">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-teal">Guide</p>
          <h1 className="mt-2 text-[34px] font-extrabold leading-[1.08] tracking-[-0.04em] text-white sm:text-[46px]">Knowledge graph vs mind map vs concept map</h1>
          <p className="mt-3 text-[14px] text-faint">
            By{" "}
            <a href={SITE.founder.url} className="font-semibold text-muted hover:text-white" rel="author">
              {SITE.founder.name}
            </a>{" "}
            · <time dateTime={PUBLISHED}>{new Date(PUBLISHED).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</time>
          </p>
        </header>

        {/* The short answer first: what search and AI assistants quote. */}
        <section aria-label="Short answer" className="mt-8 rounded-2xl border border-purple/25 bg-purple/[0.07] p-5 sm:p-6">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">The short answer</p>
          <p className="mt-2 text-[17px] leading-[1.7] text-fg/90">
            A <strong className="text-white">mind map</strong> branches out from one central idea like a tree. A <strong className="text-white">concept map</strong> connects ideas with labelled links that read as statements. A <strong className="text-white">knowledge graph</strong> is a network of
            entities joined by typed relationships, where anything can link to anything — readable by people and by software.
          </p>
        </section>

        <div className="prose-like mt-10 space-y-5 text-[17px] leading-[1.75] text-fg/85">
          <h2 className="pt-4 text-[26px] font-extrabold tracking-[-0.035em] text-white">Comparison table</h2>
          {/* Phones: one card per format. Wider screens: the full table. */}
          <div className="space-y-4 sm:hidden">
            {["Mind map", "Concept map", "Knowledge graph"].map((name, col) => (
              <section key={name} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4" aria-label={name}>
                <h3 className="text-[18px] font-extrabold text-white">{name}</h3>
                <dl className="mt-2 space-y-2 text-[15px] leading-relaxed">
                  {ROWS.map(([k, ...cells]) => (
                    <div key={k}>
                      <dt className="font-semibold text-white/90">{k}</dt>
                      <dd className="text-muted">{cells[col]}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[640px] border-collapse text-left text-[14.5px]">
              <caption className="sr-only">Mind map, concept map and knowledge graph compared</caption>
              <thead>
                <tr className="border-b border-white/15 text-white">
                  <th scope="col" className="py-3 pr-4 font-bold" />
                  <th scope="col" className="py-3 pr-4 font-bold">Mind map</th>
                  <th scope="col" className="py-3 pr-4 font-bold">Concept map</th>
                  <th scope="col" className="py-3 font-bold">Knowledge graph</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([k, ...cells]) => (
                  <tr key={k} className="border-b border-white/[0.07] align-top">
                    <th scope="row" className="py-3 pr-4 font-semibold text-white">
                      {k}
                    </th>
                    {cells.map((c, i) => (
                      <td key={i} className="py-3 pr-4 text-muted">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="pt-6 text-[26px] font-extrabold tracking-[-0.035em] text-white">What is a mind map?</h2>
          <p>
            A mind map puts one idea in the centre and branches outward into sub-topics, then sub-sub-topics. It mirrors how you brainstorm: fast, personal and loose. Branches usually carry single words or short phrases, and they rarely connect to each other. That makes mind
            maps great for notes and first overviews, but they don&apos;t say <em>how</em> two ideas relate.
          </p>

          <h2 className="pt-6 text-[26px] font-extrabold tracking-[-0.035em] text-white">What is a concept map?</h2>
          <p>
            A concept map links concepts with labelled arrows, so every pair reads as a small statement — “photosynthesis <em>produces</em> oxygen”. Concept maps are often arranged from general at the top to specific below, and they encourage cross-links between different
            areas, which is exactly where real understanding shows. Teachers use them to see whether students grasp the relationships, not just the terms.
          </p>

          <h2 className="pt-6 text-[26px] font-extrabold tracking-[-0.035em] text-white">What is a knowledge graph?</h2>
          <p>
            A knowledge graph stores knowledge as entities (people, places, events, ideas) connected by typed relationships (“born in”, “part of”, “influenced”). There&apos;s no single centre and no size limit: Wikidata&apos;s graph holds well over a hundred million items, and
            search engines use knowledge graphs to answer questions directly. A small knowledge graph about a single topic is also a very readable way for a person to see a whole subject at once.
          </p>

          <h2 className="pt-6 text-[26px] font-extrabold tracking-[-0.035em] text-white">Which one should you use?</h2>
          <ul className="list-disc space-y-2 pl-6 marker:text-purple-light">
            <li>
              <strong className="text-white">Brainstorming or quick notes</strong> — a mind map.
            </li>
            <li>
              <strong className="text-white">Checking that you understand how ideas relate</strong> — a concept map.
            </li>
            <li>
              <strong className="text-white">Exploring a subject you don&apos;t know yet, or researching a field</strong> — a knowledge graph.
            </li>
            <li>
              <strong className="text-white">Exam revision</strong> — start from a knowledge graph of the topic, then test yourself with flashcards and recall.
            </li>
          </ul>

          <h2 className="pt-6 text-[26px] font-extrabold tracking-[-0.035em] text-white">How Throvic combines them</h2>
          <p>
            Throvic starts every topic like a mind map — the topic in the centre, its most important concepts around it — but each link carries a label, like a concept map, and every concept is matched to its Wikipedia article. Expand any concept and the map grows into a
            knowledge graph, with cross-links to concepts already on it. Try the{" "}
            <Link href="/mind-map-generator" className="font-semibold text-purple-light hover:underline">
              AI mind map generator
            </Link>{" "}
            or the{" "}
            <Link href="/knowledge-graph-generator" className="font-semibold text-purple-light hover:underline">
              knowledge graph generator
            </Link>
            .
          </p>
        </div>

        <div className="mt-10">
          <StartForm placeholder="Map a topic you're studying" cta="Try it" />
        </div>

        <section className="my-16" aria-labelledby="faq">
          <h2 id="faq" className="text-[26px] font-extrabold tracking-[-0.035em] text-white">
            Frequently asked questions
          </h2>
          <FaqList faqs={FAQS} />
          <p className="mt-6 text-[13px] text-faint">
            Further reading on Wikipedia:{" "}
            {[
              ["Mind map", "https://en.wikipedia.org/wiki/Mind_map"],
              ["Concept map", "https://en.wikipedia.org/wiki/Concept_map"],
              ["Knowledge graph", "https://en.wikipedia.org/wiki/Knowledge_graph"],
            ].map(([n, u], i) => (
              <span key={u}>
                {i > 0 && " · "}
                <a href={u} target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 underline-offset-4 hover:text-white">
                  {n}
                </a>
              </span>
            ))}
          </p>
        </section>
      </article>
      <JsonLd data={article} />
      <JsonLd data={faqJsonLd(FAQS)} />
    </PageShell>
  );
}
