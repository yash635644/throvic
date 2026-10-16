import { ArrowRight, BadgeCheck, GitBranch, Layers, Share2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { Crumbs } from "@/components/site/Crumbs";
import { PageShell } from "@/components/site/PageShell";
import { FaqList, SectionTitle, StartForm, Steps, TopicChips } from "@/components/site/SeoParts";
import { CATEGORIES } from "@/lib/categories";
import { faqJsonLd, howToJsonLd, JsonLd, webPageJsonLd } from "@/lib/seo";
import { withShare } from "@/lib/share-cards";
import { exploreUrl } from "@/lib/site";
import { topicHref } from "@/lib/syllabus";
import { STARTER_TOPICS } from "@/lib/topics";

const PATH = "/mind-map-generator";
const TITLE = "Free AI Mind Map Generator — Any Topic, Verified";
const DESCRIPTION =
  "Type any topic and get an interactive AI mind map of its key ideas, people and events in seconds — every concept verified on Wikipedia. Free, no sign-up.";

export const metadata: Metadata = withShare({ title: TITLE, description: DESCRIPTION, alternates: { canonical: PATH } }, "mind-map-generator");

const STEPS = [
  { title: "Type a topic", text: "Anything from “photosynthesis” to “Mughal Empire” or “machine learning”. Throvic finds the matching Wikipedia article first." },
  { title: "Watch the map grow", text: "The main ideas, people and events appear one by one around your topic, each linked with a short label that says how they relate." },
  { title: "Tap, expand, export", text: "Tap a concept to read its summary, expand it to grow its own branch, then download the map as an image or a PDF study sheet." },
];

const DIFFERENT = [
  { Icon: BadgeCheck, title: "Every concept is checked", text: "Each idea on the map is matched to its Wikipedia article, with a summary and a source link. Anything that can't be matched is clearly marked." },
  { Icon: GitBranch, title: "It grows as you explore", text: "Expand any concept to add its own connections. Fold a branch away when you're done. The map stays tidy however deep you go." },
  { Icon: Layers, title: "Made for revision", text: "Ready-made syllabus topics come with flashcards, a 5-question quiz and spaced-repetition reminders, saved on your device." },
  { Icon: Share2, title: "Share it anywhere", text: "Download designed images sized for WhatsApp, Instagram, X and LinkedIn, a PDF with every concept summarised, or the data as JSON." },
];

const FAQS = [
  { q: "Is the mind map generator free?", a: "Yes. Throvic is free to use, with no sign-up and no limit on how many topics you explore beyond a fair-use limit that stops automated abuse." },
  { q: "Do I need an account?", a: "No. Open the explorer and type a topic. Your recent topics and revision progress are saved in your own browser, not on a server." },
  { q: "How accurate are the AI mind maps?", a: "AI suggests the concepts and how they connect, then every concept is matched to its Wikipedia article so you can read the summary and check the source. Concepts without a matching article are marked, so you know what to double-check." },
  { q: "Can I download or print my mind map?", a: "Yes. Download it as a PNG image (landscape, square, story or the full map) or as a PDF that has the map on the first page and every concept with its summary and Wikipedia link after it. You can also download the data as JSON." },
  { q: "Can I make a mind map from my own notes or a PDF?", a: "Not yet. Throvic builds maps from a topic name, using what is known about it on Wikipedia. It doesn't read uploaded files." },
  { q: "Does it work on a phone?", a: "Yes. The map is designed for touch screens: pinch to zoom, tap to read, and the details open in a sheet at the bottom. You can also install Throvic as an app from your browser." },
  { q: "What is the difference between a mind map and a knowledge graph?", a: "A mind map branches out from one central idea like a tree. A knowledge graph is a network: any concept can link to any other, and every link has a meaning. Throvic starts like a mind map and grows into a knowledge graph as you expand concepts." },
];

export default function MindMapGeneratorPage() {
  const examples = [
    ...STARTER_TOPICS.slice(0, 8).map((t) => ({ title: t.title, href: exploreUrl(t.title), color: CATEGORIES[t.category].color })),
    ...["Photosynthesis", "Constitution of India", "Green Revolution in India", "Climate change"].map((t) => ({ title: t, href: topicHref(t) })),
  ];
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Crumbs items={[{ name: "Home", href: "/" }, { name: "AI mind map generator", href: PATH }]} />

        <header className="rise mt-6 max-w-3xl">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-teal">Free · no sign-up · verified</p>
          <h1 className="mt-2 text-[38px] font-extrabold leading-[1.05] tracking-[-0.045em] text-white sm:text-[56px]">
            AI mind map generator <span className="text-brand">for any topic.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-[18px]">
            Type a topic and Throvic draws an interactive mind map of its key ideas, people and events in seconds — and checks every concept against Wikipedia, so you can trust what you revise.
          </p>
          <StartForm className="mt-7" placeholder="Type a topic — e.g. photosynthesis" cta="Make my map" />
        </header>

        <section className="mt-20" aria-labelledby="how">
          <SectionTitle id="how" eyebrow="How it works">
            Make a mind map in three steps
          </SectionTitle>
          <Steps steps={STEPS} />
        </section>

        <section className="mt-20" aria-labelledby="different">
          <SectionTitle id="different" eyebrow="Why Throvic">
            More than a mind map maker
          </SectionTitle>
          <ul className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {DIFFERENT.map(({ Icon, title, text }) => (
              <li key={title} className="reveal flex gap-4">
                <Icon className="mt-1 h-6 w-6 shrink-0 text-purple-light" aria-hidden />
                <div>
                  <h3 className="text-[18px] font-extrabold tracking-[-0.02em] text-white">{title}</h3>
                  <p className="mt-1.5 text-[15.5px] leading-relaxed text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20" aria-labelledby="examples">
          <SectionTitle id="examples" eyebrow="Examples">
            Mind map examples you can open now
          </SectionTitle>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">Each one opens as a live map you can expand, or as a ready-made topic page with flashcards and a quiz.</p>
          <TopicChips topics={examples} />
        </section>

        <section className="mt-20 grid gap-8 border-y border-white/[0.07] py-10 lg:grid-cols-[1fr_auto] lg:items-center" aria-labelledby="who">
          <div>
            <SectionTitle id="who" eyebrow="Who uses it">
              Built for students, researchers and creators
            </SectionTitle>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">
              Aspirants revise the UPSC, SSC and state PSC syllabus as maps; researchers scope a new field; teachers and writers outline a lesson or a video; and the curious follow whatever catches their eye.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["/students", "Students"],
              ["/researchers", "Researchers"],
              ["/creators", "Creators"],
              ["/upsc-mind-maps", "UPSC mind maps"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[14.5px] font-semibold text-white hover:bg-white/[0.08]">
                {label} <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-3xl" aria-labelledby="faq">
          <SectionTitle id="faq" eyebrow="FAQ">
            Questions about the mind map generator
          </SectionTitle>
          <FaqList faqs={FAQS} />
          <p className="mt-6 text-[15px] text-muted">
            Want the difference between mind maps, concept maps and knowledge graphs in detail?{" "}
            <Link href="/guides/knowledge-graph-vs-mind-map" className="font-semibold text-purple-light hover:underline">
              Read the guide
            </Link>
            .
          </p>
        </section>

        <section className="my-20 flex flex-col items-start gap-5 rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-purple/[0.12] via-white/[0.02] to-teal/[0.08] p-6 sm:p-10">
          <h2 className="text-[26px] font-extrabold tracking-[-0.035em] text-white sm:text-[32px]">Try it with your next topic</h2>
          <StartForm placeholder="What are you studying?" cta="Map it" />
        </section>
      </div>
      <JsonLd data={webPageJsonLd({ path: PATH, name: TITLE, description: DESCRIPTION, image: "/og/mind-map-generator.png" })} />
      <JsonLd data={howToJsonLd(STEPS, { name: "How to make a mind map with AI using Throvic", description: "Create an interactive, Wikipedia-verified mind map of any topic in three steps.", path: PATH })} />
      <JsonLd data={faqJsonLd(FAQS)} />
    </PageShell>
  );
}
