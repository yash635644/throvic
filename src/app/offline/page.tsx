import type { Metadata } from "next";
import { OfflineView } from "@/components/site/OfflineView";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return <OfflineView />;
}
