import { useId } from "react";
import { cn } from "@/lib/cn";

/** Throvic mark: the letter T drawn as a tiny knowledge graph, on the purple → teal brand gradient. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("h-8 w-8 shrink-0", className)}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a82e6" />
          <stop offset="1" stopColor="#4fbf9a" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id}-g)`} />
      <rect x=".5" y=".5" width="31" height="31" rx="8.5" fill="none" stroke="#fff" strokeOpacity=".18" />
      <path d="M8.5 10.5h15M16 10.5v12" stroke="#fff" strokeOpacity=".7" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="8.5" cy="10.5" r="2.3" fill="#fff" />
      <circle cx="23.5" cy="10.5" r="2.3" fill="#fff" />
      <circle cx="16" cy="10.5" r="3.1" fill="#fff" />
      <circle cx="16" cy="23" r="2.7" fill="#fff" />
    </svg>
  );
}

/** Mark + the original "Thro·vic" wordmark (gradient on "vic"). */
export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      <span className="font-display text-[19px] font-bold tracking-[-0.02em] text-fg">
        Thro<span className="text-brand">vic</span>
      </span>
    </span>
  );
}
