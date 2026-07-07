import Link from "next/link";
import { type Resource, resourceHref } from "../lib/content";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ResourceIcon({
  resource,
  className,
}: {
  resource: Resource;
  className?: string;
}) {
  if (resource.kind === "Report") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
        <path d="M3 3v18h18" />
        <path d="M7 16v-4M12 16V8M17 16v-7" />
      </svg>
    );
  }
  if (resource.kind === "Video") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
        <rect x="2.5" y="5" width="19" height="14" rx="2" />
        <path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (["Guide", "Workbook", "Manual", "Print pack"].includes(resource.kind)) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
        <path d="M12 6c-1.5-1.3-3.6-2-6-2v14c2.4 0 4.5.7 6 2 1.5-1.3 3.6-2 6-2V4c-2.4 0-4.5.7-6 2z" />
        <path d="M12 6v14" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </svg>
  );
}

/**
 * Scannable rows of resources — the shared listing treatment used on the
 * resource index, category pages, and search results.
 */
export default function ResourceList({ items }: { items: Resource[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
      {items.map((r) => (
        <li key={`${r.category}/${r.slug}`}>
          <Link
            href={resourceHref(r)}
            className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-6"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ResourceIcon resource={r} className="h-5 w-5 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-serif text-lg text-foreground group-hover:text-primary">
                {r.title}
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                {r.kind} · {r.published} · {r.format} · {r.size}
              </p>
            </div>
            <span className="hidden text-xs font-semibold uppercase tracking-wide text-muted sm:inline">
              {r.format}
            </span>
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary"
              aria-hidden
              {...stroke}
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </Link>
        </li>
      ))}
    </ul>
  );
}
