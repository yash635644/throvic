"use client";

/** The pointer-tracking part of a spotlight card: sets --x/--y for the glow in globals.css. */
export function SpotlightSurface({ children, className, as = "div" }: { children: React.ReactNode; className: string; as?: "div" | "li" }) {
  const Tag = as;
  return (
    <Tag
      className={className}
      onPointerMove={(e: React.PointerEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </Tag>
  );
}
