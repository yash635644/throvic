import {
  ArrowRight,
  BadgeCheck,
  Braces,
  ChevronsDownUp,
  Compass,
  FileText,
  Footprints,
  GitFork,
  ImageIcon,
  Layers,
  ListTree,
  Share2,
  Shuffle,
  Smartphone,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import Link from "@/components/ui/Link";
import { AUDIENCES, type Audience, type AudienceSlug, type FeatureIcon } from "@/lib/audiences";

const ICONS: Record<FeatureIcon, typeof BadgeCheck> = {
  verified: BadgeCheck,
  levels: Layers,
  pdf: FileText,
  outline: ListTree,
  share: Share2,
  phone: Smartphone,
  crosslinks: GitFork,
  json: Braces,
  fold: ChevronsDownUp,
  layouts: Workflow,
  image: ImageIcon,
  newmap: Compass,
  surprise: Shuffle,
  stream: Zap,
  trail: Footprints,
  photos: Sparkles,
};

/** "What you get" — features that exist today, framed for one audience. */
export function FeatureGrid({ audience, heading = "What you get" }: { audience: Audience; heading?: string }) {
  return (
    <section className="mt-24">
      <p className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: audience.color }}>
        Features
      </p>
      <h2 className="mt-2 text-[30px] font-extrabold tracking-[-0.035em] text-white sm:text-[38px]">{heading}</h2>
      <ul className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {audience.features.map(({ icon, title, text }) => {
          const Icon = ICONS[icon];
          return (
            <li key={title} className="border-t border-white/[0.08] pt-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${audience.color}1f`, color: audience.color }}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[18px] font-extrabold tracking-[-0.02em] text-white">{title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Links to the other audience pages, at the bottom of each. */
export function OtherAudiences({ current }: { current: AudienceSlug }) {
  return (
    <section className="mt-24 border-t border-white/[0.07] pt-12">
      <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-faint">Throvic is also for</p>
      <ul className="mt-5 grid gap-x-10 sm:grid-cols-3">
        {AUDIENCES.filter((a) => a.slug !== current).map((a) => (
          <li key={a.slug} className="border-b border-white/[0.07]">
            <Link href={`/${a.slug}`} className="group flex items-center justify-between gap-4 py-4">
              <span>
                <span className="flex items-center gap-2.5 text-[18px] font-extrabold text-white group-hover:text-purple-light">
                  <span className="h-2 w-2 rounded-full" style={{ background: a.color, boxShadow: `0 0 10px ${a.color}` }} />
                  {a.label}
                </span>
                <span className="mt-0.5 block text-[14px] text-faint">{a.short}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-white" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

