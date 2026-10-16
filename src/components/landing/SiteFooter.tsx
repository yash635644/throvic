import { ArrowUpRight } from "lucide-react";
import Link from "@/components/ui/Link";
import { SITE } from "@/lib/site";
import { InstallPrompt } from "../site/InstallPrompt";
import { Logo } from "../ui/Logo";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/explore", label: "Open the explorer" },
      { href: "/mind-map-generator", label: "AI mind map generator" },
      { href: "/knowledge-graph-generator", label: "Knowledge graph generator" },
      { href: "/upsc-mind-maps", label: "UPSC mind maps" },
      { href: "/guides/knowledge-graph-vs-mind-map", label: "Knowledge graph vs mind map" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#faq", label: "FAQ" },
      { href: "/#feedback", label: "Send feedback" },
    ],
  },
  {
    title: "Who it's for",
    links: [
      { href: "/students", label: "Students" },
      { href: "/researchers", label: "Researchers" },
      { href: "/creators", label: "Creators" },
      { href: "/curious", label: "The curious" },
      { href: "/exams", label: "Government exams" },
      { href: "/subjects", label: "Subjects" },
      { href: "/constitution", label: "Constitution map" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of use" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#0b0b11]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-14 sm:grid-cols-3 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr] lg:gap-8">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-muted">{SITE.tagline}. An interactive knowledge graph — type a topic, see how it connects, follow your curiosity.</p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="eyebrow">{col.title}</h2>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <h2 className="eyebrow">More from the creator</h2>
          <ul className="mt-4 space-y-3.5 text-[14px]">
            <li>
              <a href={SITE.gathered.url} target="_blank" rel="noopener" className="group block">
                <span className="inline-flex items-center gap-1 font-semibold text-white">
                  {SITE.gathered.name} <ArrowUpRight className="h-3.5 w-3.5 text-faint transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal" />
                </span>
                <span className="block text-muted">{SITE.gathered.blurb}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-[13px] text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Throvic. Concept details from Wikipedia <span className="whitespace-nowrap">(CC BY-SA)</span>.</p>
          <p>
            Design &amp; developed by{" "}
            <a href={SITE.founder.url} target="_blank" rel="noopener author" className="group inline-flex items-center gap-1 font-semibold text-white transition hover:text-teal">
              {SITE.founder.name}
              <ArrowUpRight className="h-3.5 w-3.5 text-faint transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal" aria-hidden />
            </a>
          </p>
        </div>
      </div>
      <InstallPrompt />
    </footer>
  );
}
