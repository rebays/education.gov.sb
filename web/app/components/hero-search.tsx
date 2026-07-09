"use client";

import { useCallback, useRef, useState } from "react";
import { categories } from "../lib/content";
import { useShortcutEntry } from "./shortcuts-provider";
import { useKeyShortcut } from "../hooks/use-key-shortcut";
import { useSearchShortcut } from "../hooks/use-search-shortcut";
import { Kbd } from "@/components/ui/kbd";
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
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [hasText, setHasText] = useState(Boolean(defaultQuery));
  const [levelOpen, setLevelOpen] = useState(false);

  useSearchShortcut(inputRef, "s", !levelOpen);
  useShortcutEntry("M", "Open level filter");
  useShortcutEntry("Enter", "Run search");

  const handleOpenFilter = useCallback(() => {
    setLevelOpen(true);
    triggerRef.current?.focus();
  }, []);
  useKeyShortcut("m", handleOpenFilter);

  return (
    <form
      ref={formRef}
      action="/search"
      role="search"
      className={`group flex h-14 w-full items-center rounded-full border border-white/20 bg-white/95 pl-6 pr-1.5 focus-within:ring-2 focus-within:ring-accent ${className}`}
    >
      <div className="relative flex min-w-0 flex-1 items-center">
        <input
          key={defaultQuery}
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={defaultQuery}
          placeholder="Search documents, reports, videos…"
          aria-label="Search the resource hub"
          onChange={(e) => setHasText(e.target.value.length > 0)}
          className="h-full w-full min-w-0 bg-transparent pr-8 text-base text-foreground placeholder:text-muted focus:outline-none"
        />
        {/* {!hasText && (
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            title="Press S to search"
            aria-label="Focus search (shortcut: S)"
            className="absolute right-0 hidden cursor-pointer sm:inline-flex group-focus-within:hidden"
          >
            <Kbd className="border-accent/40 bg-accent/10 text-accent-ink shadow-sm transition-colors hover:border-accent hover:bg-accent/20">
              S
            </Kbd>
          </button>
        )} */}
      </div>

      {/* curriculum-level scope */}
      <div className="hidden h-8 items-center border-l border-border pl-2 sm:flex">
        <label htmlFor={id} className="sr-only">
          Curriculum level
        </label>
        <Select
          key={defaultLevel}
          name="level"
          defaultValue={defaultLevel || null}
          open={levelOpen}
          onOpenChange={setLevelOpen}
        >
          <SelectTrigger
            ref={triggerRef}
            id={id}
            onKeyDown={(e) => {
              // Once the filter is closed, Enter runs the search instead of
              // re-opening the dropdown — Base UI still owns Enter while
              // `levelOpen` (confirming the highlighted option).
              if (e.key === "Enter" && !levelOpen) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
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
