"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  publications,
  publicationRef,
  publicationYear,
  type PublicationType,
} from "../lib/content";

/**
 * The publications register — a gazette-style, year-grouped record of every
 * publication. Big serif year markers sit in a sticky left rail; entries are
 * hairline-ruled rows with a mono registry code and direct download action.
 */

const filters: { label: string; value: "All" | PublicationType }[] = [
  { label: "All", value: "All" },
  { label: "Policies", value: "Policy" },
  { label: "Reports", value: "Report" },
  { label: "Guidelines", value: "Guideline" },
];

const typeVariant: Record<PublicationType, "primary" | "success" | "warning"> =
  {
    Policy: "primary",
    Report: "success",
    Guideline: "warning",
  };

export default function PublicationsRegister() {
  const [active, setActive] = useState<"All" | PublicationType>("All");
  const [query, setQuery] = useState("");

  const byType =
    active === "All"
      ? publications
      : publications.filter((p) => p.type === active);

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered =
    terms.length === 0
      ? byType
      : byType.filter((p) => {
          const haystack = [
            p.title,
            p.summary,
            p.office,
            p.type,
            p.date,
            publicationRef(p),
          ]
            .join(" ")
            .toLowerCase();
          return terms.every((t) => haystack.includes(t));
        });

  const years = [...new Set(filtered.map(publicationYear))].sort(
    (a, b) => b - a,
  );
  const groups = years.map((year) => ({
    year,
    items: filtered
      .filter((p) => publicationYear(p) === year)
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
  }));

  const latestSlug = publications[0]?.slug;

  return (
    <div>
      {/* filter bar */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3 border-b border-border pb-4">
        {filters.map((f) => {
          const isActive = active === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setActive(f.value)}
              aria-pressed={isActive}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-foreground hover:bg-surface-2"
              }`}
            >
              {f.label}
            </button>
          );
        })}

        {/* scoped filter — narrows the register in place */}
        <div className="relative ml-auto w-full sm:w-64">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Filter the register by title, office, or reference"
            placeholder="Filter the register…"
            className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <span
          className="w-full text-right text-sm text-muted sm:w-auto"
          aria-live="polite"
        >
          {filtered.length}{" "}
          {filtered.length === 1 ? "publication" : "publications"} on record
        </span>
      </div>

      {/* year-grouped register */}
      <div className="mt-10 space-y-16">
        {groups.map(({ year, items }) => (
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
                {items.length} {items.length === 1 ? "entry" : "entries"}
              </p>
            </div>

            {/* entries */}
            <ul className="divide-y divide-border border-t border-border">
              {items.map((p) => (
                <li key={p.slug} className="py-6">
                  <div className="grid gap-4 sm:grid-cols-[160px_1fr] lg:grid-cols-[160px_1fr_auto] lg:gap-8">
                    {/* registry code + type */}
                    <div>
                      <p className="font-mono text-xs text-muted">
                        {publicationRef(p)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant={typeVariant[p.type]}>{p.type}</Badge>
                        {p.slug === latestSlug && (
                          <Badge variant="accent">Latest</Badge>
                        )}
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
                        <span className="font-mono font-normal text-muted">
                          {p.size}
                        </span>
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
    </div>
  );
}
