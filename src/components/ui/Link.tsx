import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * next/link without automatic prefetching. On Cloudflare's free plan every prefetch is a billed
 * request (a page full of links could use 30–90 of them), so routes load only when clicked.
 */
export default function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
