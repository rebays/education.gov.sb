"use client";

import { categories } from "../lib/content";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * The flagship search bar from the landing hero, shared with the search
 * results page: a full pill on white with the curriculum-level scope inline
 * behind a hairline divider and a gold round submit. Designed for dark
 * (deep-blue) surfaces. Layout (width, margins, centring) comes from
 * `className`.
 */
export default function HeroSearch({
  defaultQuery = "",
  defaultLevel = "",
  className = "",
  id = "hero-level",
}: {
  defaultQuery?: string;
  defaultLevel?: string;
  className?: string;
  /** Id for the curriculum-level select — override when rendering more than one instance per page. */
  id?: string;
}) {
  return (
    <form
      action="/search"
      role="search"
      className={`group flex h-14 w-full items-center rounded-full border border-white/20 bg-white/95 pl-6 pr-1.5 focus-within:ring-2 focus-within:ring-accent ${className}`}
    >
      <input
        key={defaultQuery}
        type="search"
        name="q"
        defaultValue={defaultQuery}
        placeholder="Search documents, reports, videos…"
        aria-label="Search the resource hub"
        className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted focus:outline-none"
      />

      {/* curriculum-level scope */}
      <div className="hidden h-8 items-center border-l border-border pl-2 sm:flex">
        <label htmlFor={id} className="sr-only">
          Curriculum level
        </label>
        <Select key={defaultLevel} name="level" defaultValue={defaultLevel || null}>
          <SelectTrigger
            id={id}
            className="h-full w-auto gap-1 rounded-md border-0 bg-transparent px-2 text-sm font-medium text-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0"
          >
            <SelectValue>
              {(value: string | null) =>
                categories.find((c) => c.slug === value)?.shortTitle ?? "All levels"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value={null}>All levels</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.shortTitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <button
        type="submit"
        className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02] sm:w-auto sm:gap-2 sm:px-5"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="size-[18px] shrink-0"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="sr-only sm:not-sr-only">Search</span>
      </button>
    </form>
  );
}
