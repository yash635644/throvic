"use client";

import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import Link from "@/components/ui/Link";
import { useEffect, useRef, useState } from "react";
import { AUDIENCES } from "@/lib/audiences";
import { cn } from "@/lib/cn";
import { Logo } from "../ui/Logo";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#faq", label: "FAQ" },
];

/** "Who it's for" menu: opens on hover (mouse) or click/tap, closes on outside click or Escape. */
function AudienceMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={cn("inline-flex items-center gap-1 rounded-xl px-3.5 py-2 text-[14px] font-medium transition hover:bg-surface-hover hover:text-fg", open ? "text-fg" : "text-muted")}
      >
        Who it&apos;s for <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
          <div className="pop absolute left-1/2 top-full w-[440px] -translate-x-1/2 pt-2">
            <ul className="grid grid-cols-2 gap-1 rounded-2xl border border-white/[0.09] bg-[#13131c]/[0.98] p-2 shadow-float backdrop-blur-xl">
              {AUDIENCES.map((a) => (
                <li key={a.slug}>
                  <Link href={`/${a.slug}`} onClick={() => setOpen(false)} className="block rounded-xl p-3 transition hover:bg-white/[0.06]">
                    <span className="flex items-center gap-2 text-[14.5px] font-bold text-white">
                      <span className="h-2 w-2 rounded-full" style={{ background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
                      {a.label}
                    </span>
                    <span className="mt-0.5 block pl-4 text-[12.5px] leading-snug text-faint">{a.short}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={cn(
          "drop mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl px-2 pl-3 transition-all duration-300 sm:h-16 sm:pl-4",
          scrolled || open ? "border border-white/[0.08] bg-[#0f0f17]/90 shadow-float backdrop-blur-xl" : "border border-transparent",
        )}
      >
        <Link href="/" aria-label="Throvic home" className="rounded-xl">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          <Link href={LINKS[0].href} className="rounded-xl px-3.5 py-2 text-[14px] font-medium text-muted transition hover:bg-surface-hover hover:text-fg">
            {LINKS[0].label}
          </Link>
          <AudienceMenu />
          {LINKS.slice(1).map((l) => (
            <Link key={l.href} href={l.href} className="rounded-xl px-3.5 py-2 text-[14px] font-medium text-muted transition hover:bg-surface-hover hover:text-fg">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link href="/explore" className="hidden h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-[14px] font-semibold text-fg transition hover:bg-white/[0.1] sm:inline-flex">
            Open App <ArrowRight className="h-4 w-4" />
          </Link>
          <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-xl text-fg md:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
          <nav
            aria-label="Mobile"
            className="pop mx-auto border border-white/[0.09] bg-[#12121b]/[0.98] backdrop-blur-xl mt-2 flex max-h-[calc(100dvh-90px)] max-w-7xl flex-col gap-1 overflow-y-auto rounded-2xl p-2 shadow-float md:hidden"
          >
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-[16px] font-medium text-fg hover:bg-surface-hover">
                {l.label}
              </Link>
            ))}
            <p className="px-4 pb-1 pt-3 text-[12px] font-bold uppercase tracking-[0.14em] text-faint">Who it&apos;s for</p>
            <div className="grid grid-cols-2 gap-1">
              {AUDIENCES.map((a) => (
                <Link key={a.slug} href={`/${a.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-4 py-3 text-[15px] font-semibold text-fg hover:bg-surface-hover">
                  <span className="h-2 w-2 rounded-full" style={{ background: a.color }} />
                  {a.label}
                </Link>
              ))}
            </div>
            <Link href="/explore" onClick={() => setOpen(false)} className="bg-brand mt-2 flex h-12 items-center justify-center gap-2 rounded-xl font-semibold text-white shadow-glow">
              Launch Explorer <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        )}
    </header>
  );
}
