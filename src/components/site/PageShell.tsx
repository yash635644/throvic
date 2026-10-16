import { SiteFooter } from "../landing/SiteFooter";
import { SiteHeader } from "../landing/SiteHeader";

/** Header + soft background light + footer, shared by content pages (exams, subjects, topics). */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden" aria-hidden>
        <div className="absolute -left-[10%] -top-[40%] h-[calc(520px+260px)] w-[calc(50vw+260px)] -m-[130px] glow [--glow:rgba(127,119,221,0.180)]" />
        <div className="absolute -right-[10%] -top-[30%] h-[calc(460px+260px)] w-[calc(40vw+260px)] -m-[130px] glow [--glow:rgba(93,202,165,0.108)]" />
      </div>
      <main id="main" className="relative pt-24 sm:pt-28">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
