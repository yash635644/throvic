import { Crumbs } from "./Crumbs";
import { PageShell } from "./PageShell";

/** Simple reading layout for About / Privacy / Terms style pages. */
export function ProsePage({ title, eyebrow, intro, updated, crumb, children }: { title: string; eyebrow: string; intro?: string; updated?: string; crumb: { name: string; href: string }; children: React.ReactNode }) {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <Crumbs items={[{ name: "Home", href: "/" }, crumb]} />
        <header className="mt-6">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-purple-light">{eyebrow}</p>
          <h1 className="mt-2 text-[36px] font-extrabold leading-[1.08] tracking-[-0.04em] text-white sm:text-[48px]">{title}</h1>
          {intro && <p className="mt-4 text-[18px] leading-relaxed text-muted">{intro}</p>}
          {updated && <p className="mt-3 text-[13.5px] text-faint">Last updated {updated}</p>}
        </header>
        <div className="mt-10 space-y-5 text-[16.5px] leading-[1.75] text-fg/85 [&_a]:font-semibold [&_a]:text-purple-light [&_a:hover]:underline [&_h2]:mt-12 [&_h2]:text-[24px] [&_h2]:font-extrabold [&_h2]:tracking-[-0.03em] [&_h2]:text-white [&_h3]:mt-6 [&_h3]:text-[18px] [&_h3]:font-bold [&_h3]:text-white [&_li]:pl-1 [&_strong]:text-white [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 marker:text-faint">
          {children}
        </div>
      </div>
      <div className="h-24" />
    </PageShell>
  );
}
