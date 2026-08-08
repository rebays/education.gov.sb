"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { Icon } from "@/components/ui/icon";
import { SearchField } from "@/components/ui/search-field";
import { Skeleton } from "@/components/ui/skeleton";
import PublicationCover from "@/components/shared/publication-cover";
import PublicationRow from "@/components/shared/publication-row";
import { cn } from "@/lib/utils";
import { cmsClientFetch } from "@/lib/cms-client";
import {
  officeDisplay,
  publicationRefFor,
  publicationTypeDisplay,
  toPublicationSummary,
} from "@/components/pages/Publication/adapters";
import {
  PUBLICATIONS_QUERY,
  type PublicationListItem,
  type PublicationsQueryResult,
} from "@/components/pages/Publication/queries";
import type { PublicationType } from "../lib/content";

/**
 * The publications index body — a "Latest release" hero derived from the
 * most recent entry, followed by a gazette-style, year-grouped register.
 * Fetched from the CMS via /api/cms (mirrors NewsFront's lead-story
 * pattern); filtered and grouped client-side.
 */

const filters: { label: string; value: "All" | PublicationType }[] = [
  { label: "All", value: "All" },
  { label: "Policies", value: "Policy" },
  { label: "Reports", value: "Report" },
  { label: "Guidelines", value: "Guideline" },
];

function FeaturedSkeleton() {
  return (
    <div className="grid gap-10 rounded-3xl border border-border bg-surface p-8 sm:p-10 lg:grid-cols-[1fr_280px] lg:items-center">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="hidden aspect-3/4 w-65 justify-self-center lg:block" />
    </div>
  );
}

function RegisterSkeleton() {
  return (
    <div className="mt-10 space-y-16">
      {[0, 1].map((i) => (
        <div key={i} className="grid gap-6 lg:grid-cols-[150px_1fr]">
          <Skeleton className="h-12 w-24" />
          <div className="space-y-6 border-t border-border pt-6">
            {[0, 1, 2].map((j) => (
              <Skeleton key={j} className="h-16 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PublicationsRegister() {
  const [active, setActive] = useState<"All" | PublicationType>("All");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PublicationListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPublications = useCallback(async () => {
    const data = await cmsClientFetch<PublicationsQueryResult>(
      PUBLICATIONS_QUERY,
      {},
    );
    return data.publications;
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchPublications()
      .then((publications) => {
        if (!cancelled) setItems(publications);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load publications");
          setItems([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetchPublications]);

  if (items === null) {
    return (
      <>
        <section className="mx-auto w-full max-w-8xl px-6 pt-16">
          <FeaturedSkeleton />
        </section>
        <section className="mx-auto w-full max-w-8xl px-6 py-16">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-3 border-b border-border pb-4">
            {filters.map((f) => (
              <FilterChip key={f.value} active={f.value === "All"} disabled>
                {f.label}
              </FilterChip>
            ))}
          </div>
          <RegisterSkeleton />
        </section>
      </>
    );
  }

  if (error && items.length === 0) {
    return (
      <section className="mx-auto w-full max-w-8xl px-6 py-16">
        <p className="py-16 text-center text-sm text-muted">
          Couldn&apos;t load publications right now. {error}
        </p>
      </section>
    );
  }

  const featured = items[0];

  const byType =
    active === "All"
      ? items
      : items.filter((p) => publicationTypeDisplay[p.publicationType] === active);

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered =
    terms.length === 0
      ? byType
      : byType.filter((p) => {
          const haystack = [
            p.title,
            p.summary,
            officeDisplay[p.office] ?? p.office,
            publicationTypeDisplay[p.publicationType],
            p.date,
            publicationRefFor(p, items),
          ]
            .join(" ")
            .toLowerCase();
          return terms.every((t) => haystack.includes(t));
        });

  const publicationYear = (p: PublicationListItem) =>
    new Date(p.date).getUTCFullYear();

  const years = [...new Set(filtered.map(publicationYear))].sort(
    (a, b) => b - a,
  );
  const groups = years.map((year) => ({
    year,
    items: filtered
      .filter((p) => publicationYear(p) === year)
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
  }));

  return (
    <>
      {/* ---------- Latest release ---------- */}
      {featured && (
        <section className="mx-auto w-full max-w-8xl px-6 pt-16">
          <article className="grid gap-10 rounded-3xl border border-border bg-surface p-8 sm:p-10 lg:grid-cols-[1fr_280px] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Latest release
              </p>
              <h2 className="mt-4 max-w-3xl font-serif text-3xl leading-snug tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                <Link
                  href={`/publications/${featured.slug}`}
                  className="hover:text-primary"
                >
                  {featured.title}
                </Link>
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                {featured.summary}
              </p>
              <p className="mt-4 font-mono text-xs text-muted">
                {publicationRefFor(featured, items)} · {featured.date} ·{" "}
                {officeDisplay[featured.office] ?? featured.office}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/publications/${featured.slug}`}
                  className={cn(buttonVariants({ variant: "primary" }), "text-sm")}
                >
                  Read the summary
                  <span aria-hidden>→</span>
                </Link>
                <a
                  href={featured.url}
                  download
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "text-sm",
                  )}
                >
                  <Icon name="download" className="size-4" />
                  Download {featured.fileExtension}
                  <span className="font-mono text-xs font-normal text-muted">
                    {toPublicationSummary(featured).size}
                  </span>
                </a>
              </div>
            </div>

            {/* designed document cover */}
            <div className="hidden justify-self-center lg:block">
              <PublicationCover
                publication={toPublicationSummary(featured)}
                reference={publicationRefFor(featured, items)}
                className="w-65"
              />
            </div>
          </article>
        </section>
      )}

      {/* ---------- Register ---------- */}
      <section className="mx-auto w-full max-w-8xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              The register
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
              All publications, by year.
            </h2>
          </div>
        </div>

        {/* filter bar */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3 border-b border-border pb-4">
          {filters.map((f) => (
            <FilterChip
              key={f.value}
              active={active === f.value}
              onClick={() => setActive(f.value)}
            >
              {f.label}
            </FilterChip>
          ))}

          {/* scoped filter — narrows the register in place */}
          <SearchField
            className="ml-auto w-full sm:w-64"
            inputClassName="bg-background pr-3 placeholder:text-muted/60"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search publications by title, office, or reference"
            placeholder="Search publications"
          />
        </div>

        {/* year-grouped register */}
        <div className="mt-10 space-y-16">
          {groups.map(({ year, items: yearItems }) => (
            <section
              key={year}
              aria-label={`Publications from ${year}`}
              className="grid gap-6 lg:grid-cols-[150px_1fr]"
            >
              {/* year rail */}
              <div className="lg:sticky lg:top-32 lg:self-start">
                <h3 className="font-serif text-5xl tracking-tight text-primary/65 sm:text-6xl">
                  {year}
                </h3>
                <p className="mt-2 font-mono text-xs text-muted">
                  {yearItems.length} {yearItems.length === 1 ? "entry" : "entries"}
                </p>
              </div>

              {/* entries */}
              <ul className="divide-y divide-border border-t border-border">
                {yearItems.map((p) => (
                  <li key={p.slug} className="py-6">
                    <PublicationRow
                      publication={toPublicationSummary(p)}
                      reference={publicationRefFor(p, items)}
                      isLatest={p.slug === featured?.slug}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {groups.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">
              {terms.length > 0
                ? `No publications match “${query.trim()}”. Try a shorter term, or clear the filter.`
                : "No publications of this type on record yet."}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
