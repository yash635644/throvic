import { ArrowRight } from "lucide-react";
import Link from "@/components/ui/Link";
import { LogoMark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 text-center">
      <div className="grid-lines absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_45%,#000_40%,transparent_100%)]" aria-hidden />
      <div className="absolute left-1/2 top-1/3 h-[calc(380px+240px)] w-[calc(620px+240px)] -translate-x-1/2 -my-[120px] glow [--glow:rgba(127,119,221,0.180)]" aria-hidden />
      <div className="relative">
        <LogoMark className="mx-auto h-12 w-12" />
        <p className="text-brand mt-8 font-display text-[88px] font-bold leading-none">404</p>
        <h1 className="mt-3 font-display text-[28px] font-bold text-white">This node isn&apos;t on the map</h1>
        <p className="mt-2 text-muted">The page you were looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/explore" className="bg-brand inline-flex h-12 items-center gap-2 rounded-xl px-6 font-semibold text-white shadow-glow">
            Explore a topic <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/" className="inline-flex h-12 items-center rounded-xl border border-white/10 bg-white/[0.04] px-6 font-medium text-white hover:bg-white/[0.08]">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
