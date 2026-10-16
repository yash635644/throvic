import { SpotlightSurface } from "./Spotlight";

/**
 * Rises into view as it is scrolled to. Pure CSS (.reveal in globals.css), so it needs no JavaScript
 * and never hides text from the first paint or from search engines. \`delay\` is kept for callers but
 * scroll-linked animations follow the scroll position instead.
 */
export function Reveal({ children, className, as = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "li" | "section" }) {
  const Tag = as;
  return <Tag className={className ? `reveal ${className}` : "reveal"}>{children}</Tag>;
}

/** Card whose border lights up around the pointer (see .spotlight in globals.css). */
export function Spotlight({ children, className, as = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "li" }) {
  return (
    <SpotlightSurface as={as} className={`reveal spotlight ${className ?? ""}`}>
      {children}
    </SpotlightSurface>
  );
}
