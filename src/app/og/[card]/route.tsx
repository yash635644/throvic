import { renderShareCard, shareCards } from "@/lib/share-cards";

/** /og/<card>.png: link-preview images, all built at deploy (see lib/share-cards.tsx). */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(shareCards()).map((key) => ({ card: `${key}.png` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ card: string }> }) {
  const { card } = await params;
  const data = shareCards()[card.replace(/\.png$/, "")];
  if (!data) return new Response("Not found", { status: 404 });
  return renderShareCard(data);
}
