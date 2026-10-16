import type { Metadata } from "next";
import { ReducedMotion } from "@/components/ui/ReducedMotion";
import { withShare } from "@/lib/share-cards";
import { ExploreApp } from "@/components/explore/ExploreApp";

export const metadata: Metadata = withShare(
  {
    title: "Explore — interactive knowledge graph",
    description: "Type any topic and explore it as an interactive knowledge graph. Every concept is checked against Wikipedia. Tap to read, expand to go deeper.",
    alternates: { canonical: "/explore" },
  },
  "explore",
);

export default function ExplorePage() {
  return (
    <>
      <ReducedMotion><ExploreApp /></ReducedMotion>
      <noscript>
        <p style={{ padding: 24 }}>Throvic needs JavaScript to draw the interactive graph.</p>
      </noscript>
    </>
  );
}
