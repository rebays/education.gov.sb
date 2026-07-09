import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  publicationRef,
  type Publication,
  type PublicationType,
} from "../lib/content";

export const typeVariant: Record<PublicationType, "primary" | "success" | "warning"> =
  {
    Policy: "primary",
    Report: "success",
    Guideline: "warning",
  };

/**
 * A gazette-style register entry: mono registry code and type badge left,
 * serif title and summary centre, direct download and summary actions right.
 */
export default function PublicationRow({
  publication: p,
  isLatest = false,
}: {
  publication: Publication;
  isLatest?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[160px_1fr] lg:grid-cols-[160px_1fr_auto] lg:gap-8">
      {/* registry code + type */}
      <div>
        <p className="font-mono text-xs text-muted">{publicationRef(p)}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant={typeVariant[p.type]}>{p.type}</Badge>
          {isLatest && <Badge variant="accent">Latest</Badge>}
        </div>
      </div>

      {/* title + summary */}
      <div className="min-w-0">
        <h4 className="font-serif text-xl leading-snug">
          <Link
            href={`/publications/${p.slug}`}
            className="text-foreground hover:text-primary"
          >
            {p.title}
          </Link>
        </h4>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
          {p.summary}
        </p>
        <p className="mt-2 text-xs text-muted">
          {p.date} · {p.office}
        </p>
      </div>

      {/* actions */}
      <div className="flex items-start gap-2 lg:flex-col lg:items-end">
        <a
          href="#"
          aria-label={`Download ${p.title} (${p.format}, ${p.size})`}
          title="Download will be available once the CMS is connected"
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "h-9 px-3 text-xs",
          )}
        >
          <Icon name="download" className="size-3.5" />
          {p.format}
          <span className="font-mono font-normal text-muted">{p.size}</span>
        </a>
        <Link
          href={`/publications/${p.slug}`}
          className="inline-flex h-9 items-center gap-1 px-1 text-xs font-semibold text-primary hover:underline"
        >
          Summary
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
