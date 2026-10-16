import { ArrowRight, BadgeCheck, GraduationCap, Layers, Microscope, MonitorSmartphone, PenTool, Plus, Telescope, Zap } from "lucide-react";
import { ReducedMotion } from "@/components/ui/ReducedMotion";
import type { Metadata } from "next";
import { withShare } from "@/lib/share-cards";
import Link from "@/components/ui/Link";
import { FeedbackForm } from "@/components/landing/FeedbackForm";
import { HomeExplorer } from "@/components/landing/HomeExplorer";
import { ConceptOfDay } from "@/components/site/ConceptOfDay";
import { Reveal } from "@/components/landing/Reveal";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { CATEGORIES } from "@/lib/categories";
import { FAQS } from "@/lib/faq";
import { faqJsonLd, howToJsonLd, JsonLd, topicsJsonLd } from "@/lib/seo";
import { exploreUrl, SITE } from "@/lib/site";
import { STARTER_TOPICS, SURPRISE_TOPICS } from "@/lib/topics";

export const metadata: Metadata = withShare(
  {
    title: { absolute: SITE.title },
    alternates: { canonical: "/" },
  },
  "home",
);

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">{children}</p>;
}
function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`mt-3 text-[32px] font-extrabold leading-[1.1] tracking-[-0.035em] text-white sm:text-[42px] ${className}`}>{children}</h2>;
}

const STEPS = [
  { title: "Search a topic", text: "Anything from quantum mechanics to the Mughal Empire. Suggestions come from Wikipedia as you type." },
  { title: "Watch it unfold", text: "Key concepts stream in one by one, linked by what connects them and checked against Wikipedia." },
  { title: "Follow your curiosity", text: "Expand any concept into a new branch, fold branches away, and keep going as deep as you like." },
];

/* Small visuals for the feature rows (pure SVG/CSS, no images). */
function VerifiedVisual() {
  const rows = [
    ["General relativity", "Theory of gravitation", CATEGORIES.science.color],
    ["Stephen Hawking", "English theoretical physicist", CATEGORIES.people.color],
    ["LIGO", "Gravitational-wave observatory", CATEGORIES.technology.color],
  ] as const;
  return (
    <div className="space-y-2.5">
      {rows.map(([t, d, c], i) => (
        <div key={t} className="flex items-center gap-3.5 rounded-2xl bg-white/[0.035] px-4 py-3.5 ring-1 ring-white/[0.06]" style={{ marginLeft: i * 18 }}>
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: c, boxShadow: `0 0 14px ${c}` }} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-bold text-white">{t}</span>
            <span className="block truncate text-[13px] text-faint">{d}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-teal/12 px-2 py-0.5 text-[11.5px] font-bold text-teal">
            <BadgeCheck className="h-3.5 w-3.5" /> Wikipedia
          </span>
        </div>
      ))}
    </div>
  );
}

function BranchVisual() {
  const kids = [
    [250, 70],
    [300, 150],
    [262, 228],
  ];
  return (
    <svg viewBox="0 0 400 300" className="w-full" aria-hidden>
      <circle cx="255" cy="150" r="118" fill="rgba(239,159,39,0.06)" stroke="rgba(239,159,39,0.3)" strokeDasharray="3 7" />
      <path d="M70 150 Q130 120 190 150" stroke="#7f77dd" strokeOpacity=".6" strokeWidth="2" fill="none" />
      {kids.map(([x, y]) => (
        <path key={`${x}${y}`} d={`M190 150 Q${(190 + x) / 2} ${(150 + y) / 2 - 12} ${x} ${y}`} stroke="#ef9f27" strokeOpacity=".7" strokeWidth="1.8" fill="none" />
      ))}
      <path d="M70 150 L40 70 M70 150 L36 228" stroke="#7f77dd" strokeOpacity=".35" strokeWidth="1.5" fill="none" />
      <circle cx="40" cy="70" r="8" fill="#7f77dd" />
      <circle cx="36" cy="228" r="8" fill="#5dcaa5" />
      <circle cx="70" cy="150" r="20" fill="#13131c" stroke="#5dcaa5" strokeWidth="4" />
      <circle cx="70" cy="150" r="8" fill="#afa9ec" />
      <circle cx="190" cy="150" r="12" fill="#ef9f27" />
      <circle cx="190" cy="150" r="17" fill="none" stroke="#ef9f27" strokeOpacity=".7" strokeWidth="1.5" />
      {kids.map(([x, y]) => (
        <circle key={`n${x}${y}`} cx={x} cy={y} r="8.5" fill="#ef9f27" fillOpacity=".85" />
      ))}
      <rect x="318" y="58" width="38" height="20" rx="10" fill="#ef9f27" />
      <text x="337" y="72" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0d0d14">
        +4
      </text>
    </svg>
  );
}

function ShareVisual() {
  return (
    <div className="relative mx-auto aspect-[380/250] w-full max-w-[380px]">
      {[
        { w: 210, h: 112, x: 0, y: 44, r: -6, label: "Landscape" },
        { w: 140, h: 140, x: 168, y: 4, r: 4, label: "Square" },
        { w: 98, h: 174, x: 280, y: 60, r: 8, label: "Story" },
      ].map((c) => (
        <div
          key={c.label}
          className="absolute overflow-hidden rounded-2xl bg-[#11111a] shadow-float ring-1 ring-white/10"
          style={{ width: `${(c.w / 380) * 100}%`, aspectRatio: `${c.w} / ${c.h}`, left: `${(c.x / 380) * 100}%`, top: `${(c.y / 250) * 100}%`, transform: `rotate(${c.r}deg)` }}
        >
          <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-purple/40 blur-2xl" />
          <div className="absolute -bottom-10 -right-6 h-28 w-28 rounded-full bg-teal/30 blur-2xl" />
          <span className="absolute left-3 top-3 text-[11px] font-extrabold text-white">Black hole</span>
          <span className="absolute bottom-3 left-3 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/80">{c.label}</span>
          <svg viewBox="0 0 100 100" className={`absolute top-1/2 h-1/2 -translate-y-1/2 opacity-90 ${c.label === "Landscape" ? "left-[42%]" : "right-2"}`}>
            <path d="M50 50 L22 28 M50 50 L80 30 M50 50 L78 76 M50 50 L24 76" stroke="#afa9ec" strokeOpacity=".5" />
            <circle cx="50" cy="50" r="9" fill="#13131c" stroke="#5dcaa5" strokeWidth="3" />
            <circle cx="22" cy="28" r="5" fill="#7f77dd" />
            <circle cx="80" cy="30" r="5" fill="#e9a3c9" />
            <circle cx="78" cy="76" r="5" fill="#5dcaa5" />
            <circle cx="24" cy="76" r="5" fill="#ef9f27" />
          </svg>
        </div>
      ))}
    </div>
  );
}

const ROWS = [
  { eyebrow: "Accurate", title: "Every concept, checked against Wikipedia", text: "AI suggests the connections; Throvic verifies each concept against its Wikipedia article and brings its photo, summary and source link. Anything without a match is clearly marked.", Visual: VerifiedVisual },
  { eyebrow: "Organised", title: "Go deep without getting lost", text: "Each expansion grows its own branch, wrapped in a soft halo. Fold branches you're done with, follow your path back to the main topic, or switch to an outline at any time.", Visual: BranchVisual },
  { eyebrow: "Shareable", title: "Designed to be shared", text: "Export a map as a ready-made image for X, LinkedIn, Instagram or WhatsApp — or as a PDF with the map and a study sheet of every concept.", Visual: ShareVisual },
];

const SMALL = [
  { Icon: Zap, color: "#ef9f27", title: "Streams in live", text: "Concepts appear the moment they're found. Popular maps open instantly." },
  { Icon: MonitorSmartphone, color: "#85b7eb", title: "Every device", text: "Touch gestures and sheets on phones and tablets; docked panels and shortcuts on desktop." },
  { Icon: Layers, color: "#e9a3c9", title: "Your depth", text: "Web, radial or tree layout, and simple, standard or expert explanations." },
];

const AUDIENCES = [
  { Icon: GraduationCap, color: "#7f77dd", href: "/students", title: "Students", text: "Turn a syllabus topic into one picture — causes, people and outcomes together." },
  { Icon: Microscope, color: "#5dcaa5", href: "/researchers", title: "Researchers", text: "Spot links across fields that search results hide, then go to the source." },
  { Icon: PenTool, color: "#ef9f27", href: "/creators", title: "Creators", text: "Outline lessons, scripts and worlds. Map the territory, then tell the story." },
  { Icon: Telescope, color: "#85b7eb", href: "/curious", title: "The curious", text: "Start at jazz, end up at West African trade routes." },
];

export default function HomePage() {
  const tags = [...STARTER_TOPICS.map((t) => ({ title: t.title, color: CATEGORIES[t.category].color })), ...SURPRISE_TOPICS.slice(0, 12).filter((t) => !STARTER_TOPICS.some((s) => s.title === t)).map((title) => ({ title, color: "#afa9ec" }))];

  return (
    <>
      <SiteHeader />
      <main id="main">
        <ReducedMotion><HomeExplorer /></ReducedMotion>
        <div className="mx-auto max-w-7xl px-3 pt-16 sm:px-6 sm:pt-20">
          <ConceptOfDay />
        </div>

        {/* How it works — timeline */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-24 sm:px-6 sm:py-32">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <Eyebrow>How it works</Eyebrow>
              <H2>From one word to a map of ideas.</H2>
              <p className="mt-4 max-w-md text-[16.5px] leading-relaxed text-muted">No account, no setup. Three steps, a few seconds each.</p>
              <Link href="/explore" className="mt-7 inline-flex items-center gap-1.5 text-[15px] font-bold text-white underline decoration-purple/50 decoration-2 underline-offset-[6px] hover:decoration-teal">
                Try it now <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
            <ol className="relative">
              <span className="absolute bottom-6 left-[19px] top-6 w-px bg-gradient-to-b from-purple via-[#6fa2c6] to-teal opacity-50" aria-hidden />
              {STEPS.map((s, i) => (
                <Reveal as="li" key={s.title} delay={i * 0.08} className="relative flex scroll-mt-28 gap-6 pb-10 last:pb-0">
                  <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0d0d14] text-[14px] font-extrabold text-white ring-2 ring-purple/60">{i + 1}</span>
                  <div className="pt-1.5" id={`step-${i + 1}`}>
                    <h3 className="text-[20px] font-extrabold tracking-[-0.02em] text-white">{s.title}</h3>
                    <p className="mt-1.5 max-w-lg text-[16px] leading-relaxed text-muted">{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Features — alternating rows */}
        <section id="features" className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 sm:py-32">
            <Reveal className="max-w-2xl">
              <Eyebrow>Why Throvic</Eyebrow>
              <H2>Built to make knowledge click.</H2>
            </Reveal>
            <div className="mt-16 space-y-24 sm:mt-20 sm:space-y-28">
              {ROWS.map(({ eyebrow, title, text, Visual }, i) => (
                <div key={title} className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
                  <Reveal className={i % 2 ? "lg:order-2" : ""}>
                    <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-teal">{eyebrow}</p>
                    <h3 className="mt-3 text-[26px] font-extrabold leading-[1.15] tracking-[-0.03em] text-white sm:text-[32px]">{title}</h3>
                    <p className="mt-4 max-w-lg text-[16.5px] leading-relaxed text-muted">{text}</p>
                  </Reveal>
                  <Reveal delay={0.1} className={i % 2 ? "lg:order-1" : ""}>
                    <Visual />
                  </Reveal>
                </div>
              ))}
            </div>
            <div className="mt-24 grid gap-10 border-t border-white/[0.06] pt-12 sm:grid-cols-3 sm:gap-8">
              {SMALL.map(({ Icon, color, title, text }, i) => (
                <Reveal key={title} delay={i * 0.06} className="flex gap-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} />
                  <div>
                    <h3 className="text-[16.5px] font-extrabold text-white">{title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-muted">{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for — divided columns */}
        <section className="border-t border-white/[0.06] bg-white/[0.012]">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 sm:py-28">
            <Reveal className="max-w-2xl">
              <Eyebrow>Who it&apos;s for</Eyebrow>
              <H2>Who builds with Throvic?</H2>
            </Reveal>
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4">
              {AUDIENCES.map(({ Icon, color, title, text, href }, i) => (
                <Reveal key={title} delay={i * 0.06} className="border-white/[0.07] py-6 sm:px-7 sm:first:pl-0 sm:[&:nth-child(n+2)]:border-l lg:py-2">
                  <Link href={href} className="group block">
                    <Icon className="h-6 w-6" style={{ color }} />
                    <h3 className="mt-4 flex items-center gap-1.5 text-[19px] font-extrabold tracking-[-0.02em] text-white group-hover:text-purple-light">
                      {title} <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">{text}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Topics — tag cloud */}
        <section id="topics" className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-6 sm:py-32">
            <Reveal>
              <Eyebrow>Start somewhere</Eyebrow>
              <H2>Popular maps</H2>
              <p className="mx-auto mt-4 max-w-md text-[16.5px] text-muted">Tap any topic to open its map instantly.</p>
            </Reveal>
            <Reveal delay={0.1} className="mt-12 flex flex-wrap justify-center gap-2.5">
              {tags.map((t, i) => (
                <Link
                  key={t.title}
                  href={exploreUrl(t.title)}
                  className={`group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] font-semibold text-white/90 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] hover:text-white ${i % 5 === 0 ? "px-5 py-3 text-[17px]" : "px-4 py-2.5 text-[15px]"}`}
                >
                  <span className="h-2 w-2 rounded-full transition group-hover:scale-125" style={{ background: t.color, boxShadow: `0 0 10px ${t.color}` }} />
                  {t.title}
                </Link>
              ))}
            </Reveal>
          </div>
        </section>

        {/* FAQ — two columns, lines */}
        <section id="faq" className="border-t border-white/[0.06]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-24 sm:px-6 sm:py-32 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <Eyebrow>FAQ</Eyebrow>
              <H2>Questions, answered.</H2>
              <p className="mt-4 max-w-sm text-[16.5px] leading-relaxed text-muted">Something else on your mind? Send it through the form below.</p>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="border-t border-white/[0.08]">
                {FAQS.map((f, i) => (
                  <details key={f.q} className="faq group border-b border-white/[0.08]" open={i === 0}>
                    <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 text-left">
                      <h3 className="text-[17px] font-bold text-white transition group-hover:text-purple-light">{f.q}</h3>
                      <span className="faq-icon grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.06] text-muted transition-transform duration-300">
                        <Plus className="h-4 w-4" />
                      </span>
                    </summary>
                    <p className="max-w-2xl pb-6 text-[16px] leading-relaxed text-muted">{f.a}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
          <JsonLd data={faqJsonLd(FAQS)} />
          <JsonLd data={howToJsonLd(STEPS)} />
          <JsonLd data={topicsJsonLd(STARTER_TOPICS)} />
        </section>

        {/* Feedback — split */}
        <section id="feedback" className="border-t border-white/[0.06]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-24 sm:px-6 sm:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <Eyebrow>Feedback</Eyebrow>
              <H2>Help shape Throvic.</H2>
              <p className="mt-4 max-w-sm text-[16.5px] leading-relaxed text-muted">A topic that mapped badly, a bug, or an idea for a feature — every message is read by the developer.</p>
            </Reveal>
            <Reveal delay={0.08}>
              <ReducedMotion><FeedbackForm /></ReducedMotion>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="px-3 pb-3 sm:px-4 sm:pb-4">
          <Reveal className="relative overflow-hidden rounded-[28px] px-6 py-16 text-center sm:py-20">
            <div className="bg-brand absolute inset-0" aria-hidden />
            <div className="grid-lines absolute inset-0 opacity-50" aria-hidden />
            <div className="relative">
              <h2 className="text-[32px] font-extrabold tracking-[-0.04em] text-white sm:text-[48px]">Pick a topic. See where it leads.</h2>
              <p className="mx-auto mt-3 max-w-xl text-[17px] font-medium text-white/85">Free, no sign-up, a few seconds to your first map.</p>
              <Link href="/explore" className="mt-8 inline-flex h-13 items-center gap-2 rounded-full bg-[#0d0d14] px-7 py-3.5 text-[16px] font-bold text-white shadow-2xl transition hover:scale-[1.03] active:scale-[0.98]">
                Open the explorer <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
