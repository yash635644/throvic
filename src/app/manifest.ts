import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: SITE.title,
    short_name: SITE.name,
    description: SITE.description,
    lang: SITE.language,
    start_url: "/explore",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "any",
    background_color: SITE.themeColor,
    theme_color: SITE.themeColor,
    categories: ["education", "reference", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    shortcuts: [
      { name: "Explore a topic", short_name: "Explore", url: "/explore", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "My revision", short_name: "Revise", url: "/students#your-study", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Constitution of India map", short_name: "Constitution", url: "/constitution", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
