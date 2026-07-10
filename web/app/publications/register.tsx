"use client";

import { useState } from "react";
import { FilterChip } from "@/components/ui/filter-chip";
import { SearchField } from "@/components/ui/search-field";
import PublicationRow from "@/components/shared/publication-row";
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
                  <PublicationRow
                    publication={p}
                    isLatest={p.slug === latestSlug}
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
    </div>
  );
}
