import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { Crumbs } from "@/components/site/Crumbs";
import { PageShell } from "@/components/site/PageShell";
import { FaqList, SectionTitle, StartForm, Steps, TopicChips } from "@/components/site/SeoParts";
import { faqJsonLd, howToJsonLd, JsonLd, webPageJsonLd } from "@/lib/seo";
import { withShare } from "@/lib/share-cards";
import { exploreUrl } from "@/lib/site";

const PATH = "/knowledge-graph-generator";
const TITLE = "Knowledge Graph Generator — Any Topic, Free";
const DESCRIPTION =
  "Free AI knowledge graph generator: turn any topic into an interactive graph of concepts and labelled relationships, verified on Wikipedia. Export PNG, PDF or JSON.";

export const metadata: Metadata = withShare({ title: TITLE, description: DESCRIPTION, alternates: { canonical: PATH } }, "knowledge-graph-generator");

const STEPS = [
  { title: "Enter a topic", text: "Throvic resolves it to the matching Wikipedia article, so the graph is anchored to a real, well-defined subject." },
  { title: "Get nodes and relationships", text: "AI proposes the most important connected concepts and labels each link — “founded by”, “causes”, “part of” — while every node is matched to its Wikipedia article." },
  { title: "Explore and export", text: "Expand any node to grow the graph, switch layouts, find a concept, then export the graph as an image, a PDF study sheet or JSON data." },
];

const FEATURES = [
  { title: "Labelled relationships", text: "Links say how two concepts relate, not just that they do — read them on the map or in each concept's panel." },
  { title: "Verified nodes", text: "Each node carries its Wikipedia summary, photo and source link. Nodes without a matching article are marked." },
  { title: "Expand without limits", text: "Grow any node into its own branch; Throvic avoids duplicates and adds cross-links to concepts already on the graph." },
  { title: "Three layouts", text: "A force-directed web, a radial view by level, or a top-down tree. Fold branches to keep large graphs readable." },
  { title: "Outline, search and keyboard", text: "Every graph also has a text outline, find-in-map, and full keyboard navigation with screen-reader announcements." },
  { title: "Data export", text: "Download nodes (title, category, summary, Wikipedia link) and edges (source, target, label) as JSON for your own tools." },
];

const FAQS = [
  { q: "What is a knowledge graph?", a: "A knowledge graph is a network of entities — people, places, events, ideas — connected by relationships that have a meaning, such as “invented by” or “part of”. Unlike a list or a tree, any entity can connect to any other, which makes it good for seeing how a subject fits together." },
  { q: "Is this the same as Google's Knowledge Graph?", a: "No. Google's Knowledge Graph is Google's own database of facts used in search results. Throvic builds a small, focused knowledge graph about one topic for you to explore and learn from." },
  { q: "Is the knowledge graph generator free?", a: "Yes. It is free with no sign-up. A fair-use limit stops automated abuse." },
  { q: "Where does the data come from?", a: "An AI model suggests the concepts and relationships; every concept is then checked against English Wikipedia, which supplies the summaries, photos and source links." },
  { q: "Can I export the graph data?", a: "Yes. Open Share and choose “Download data (JSON)”. You get every node with its title, category, summary and Wikipedia link, and every edge with its label." },
  { q: "How big can a graph get?", a: "A new graph starts with around nine concepts. Each expansion adds up to six more, and you can keep expanding — fold branches you're done with to keep it readable." },
];

export default function KnowledgeGraphGeneratorPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Crumbs items={[{ name: "Home", href: "/" }, { name: "Knowledge graph generator", href: PATH }]} />

        <header className="rise mt-6 max-w-3xl">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-teal">Free · AI + Wikipedia</p>
          <h1 className="mt-2 text-[38px] font-extrabold leading-[1.05] tracking-[-0.045em] text-white sm:text-[56px]">
            Knowledge graph generator <span className="text-brand">for any topic.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-[18px]">
            Turn a topic into an interactive knowledge graph: the concepts around it as nodes, and labelled links that say how they relate. Every node is verified on Wikipedia.
          </p>
          <StartForm className="mt-7" placeholder="Type a topic — e.g. CRISPR" cta="Build the graph" />
        </header>

        <section className="mt-20 max-w-3xl" aria-labelledby="what">
          <SectionTitle id="what" eyebrow="The basics">
            What is a knowledge graph?
          </SectionTitle>
          <p className="mt-4 text-[17px] leading-[1.75] text-fg/85">
            A <strong className="text-white">knowledge graph</strong> represents knowledge as a network: <strong className="text-white">nodes</strong> for things (people, places, events, ideas) and <strong className="text-white">edges</strong> for the relationships between them. Because every edge has a meaning and any node can connect to any other, a knowledge graph shows how a subject fits together — which is why search engines, encyclopaedias like Wikidata and recommendation systems use them.
          </p>
          <p className="mt-4 text-[17px] leading-[1.75] text-fg/85">
            For learning, the same idea helps you see the structure of a topic before the details: what it&apos;s made of, what caused it, who shaped it and what it led to.
          </p>
        </section>

        <section className="mt-20" aria-labelledby="how">
          <SectionTitle id="how" eyebrow="How it works">
            How Throvic generates your knowledge graph
          </SectionTitle>
          <Steps steps={STEPS} />
        </section>

        <section className="mt-20" aria-labelledby="features">
          <SectionTitle id="features" eyebrow="Features">
            Built to explore, not just to look at
          </SectionTitle>
          <ul className="mt-6 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="reveal border-t border-white/[0.08] pt-5">
                <h3 className="text-[17.5px] font-extrabold tracking-[-0.02em] text-white">{f.title}</h3>
                <p className="mt-1.5 text-[15.5px] leading-relaxed text-muted">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20" aria-labelledby="examples">
          <SectionTitle id="examples" eyebrow="Examples">
            Knowledge graph examples
          </SectionTitle>
          <TopicChips topics={["Artificial intelligence", "CRISPR", "Roman Empire", "Black hole", "Renaissance", "Climate change", "Blockchain", "Human brain"].map((t) => ({ title: t, href: exploreUrl(t) }))} />
          <p className="mt-6 text-[15px] text-muted">
            Researching a field? See{" "}
            <Link href="/researchers" className="font-semibold text-purple-light hover:underline">
              Throvic for researchers
            </Link>
            . Comparing formats? Read{" "}
            <Link href="/guides/knowledge-graph-vs-mind-map" className="font-semibold text-purple-light hover:underline">
              knowledge graph vs mind map vs concept map
            </Link>
            .
          </p>
        </section>

        <section className="mt-16 max-w-3xl" aria-labelledby="faq">
          <SectionTitle id="faq" eyebrow="FAQ">
            Knowledge graph generator questions
          </SectionTitle>
          <FaqList faqs={FAQS} />
        </section>

        <section className="my-20 flex flex-col items-start gap-5 rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-purple/[0.12] via-white/[0.02] to-teal/[0.08] p-6 sm:p-10">
          <h2 className="text-[26px] font-extrabold tracking-[-0.035em] text-white sm:text-[32px]">Generate your first knowledge graph</h2>
          <StartForm placeholder="Any topic, any field" cta="Build it" />
        </section>
      </div>
      <JsonLd data={webPageJsonLd({ path: PATH, name: TITLE, description: DESCRIPTION, image: "/og/knowledge-graph-generator.png" })} />
      <JsonLd data={howToJsonLd(STEPS, { name: "How to generate a knowledge graph of any topic with Throvic", description: "Build an interactive, Wikipedia-verified knowledge graph in three steps.", path: PATH })} />
      <JsonLd data={faqJsonLd(FAQS)} />
    </PageShell>
  );
}
