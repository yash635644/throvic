import { ChevronRight } from "lucide-react";
import Link from "@/components/ui/Link";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

/** Visible breadcrumb trail + matching BreadcrumbList structured data. */
export function Crumbs({ items }: { items: { name: string; href: string }[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[13.5px] text-faint">
        {items.map((c, i) => (
          <span key={c.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
            {i === items.length - 1 ? (
              <span aria-current="page" className="font-semibold text-muted">
                {c.name}
              </span>
            ) : (
              <Link href={c.href} className="transition hover:text-white">
                {c.name}
              </Link>
            )}
          </span>
        ))}
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
