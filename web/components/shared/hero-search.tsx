"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  categories,
  getCategory,
  resourceHref,
  searchContent,
  type SearchResult,
} from "@/app/lib/content";
import { useShortcutEntry } from "./shortcuts-provider";
import { useKeyShortcut } from "@/app/hooks/use-key-shortcut";
import { useSearchShortcut } from "@/app/hooks/use-search-shortcut";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_SUGGESTIONS = 6;

function resultHref(result: SearchResult): string {
  if (result.kind === "resource") return resourceHref(result.item);
  if (result.kind === "publication") return `/publications/${result.item.slug}`;
  return `/news/${result.item.slug}`;
}

function resultIcon(result: SearchResult): IconName {
  const kind = result.kind === "resource" ? result.item.kind : result.kind === "publication" ? result.item.type : "";
  if (kind === "Video") return "video";
  if (kind === "Report") return "report";
  if (result.kind === "news") return "calendar";
  return "document";
}

function resultMeta(result: SearchResult): { chip: string; detail: string; title: string } {
  if (result.kind === "resource") {
    const cat = getCategory(result.item.category);
    return { chip: cat?.shortTitle ?? "Resource", detail: result.item.kind, title: result.item.title };
  }
  if (result.kind === "publication") {
    return { chip: "Publication", detail: result.item.type, title: result.item.title };
  }
  return { chip: "News", detail: result.item.category, title: result.item.title };
}

/**
 * The flagship search bar from the landing hero, shared with the search
 * results page: a full pill on white with the curriculum-level scope inline
 * behind a hairline divider and a gold round submit. Designed for dark
 * (deep-blue) surfaces. Layout (width, margins, centring) comes from
 * `className`.
 *
 * As the user types, matching resources/publications/news appear in an
 * instant-results panel beneath the bar (via `searchContent`) so they can
 * jump straight to an item without waiting for the full results page.
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
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const [query, setQuery] = useState(defaultQuery);
  const [levelOpen, setLevelOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const results = useMemo(
    () => (query.trim() ? searchContent(query).slice(0, MAX_SUGGESTIONS) : []),
    [query]
  );
  const showPanel = suggestOpen && results.length > 0;

  useSearchShortcut(inputRef, "s", !levelOpen);
  useShortcutEntry("M", "Open level filter");
  useShortcutEntry("Enter", "Run search");

  const handleOpenFilter = useCallback(() => {
    setLevelOpen(true);
    setSuggestOpen(false);
    triggerRef.current?.focus();
  }, []);
  useKeyShortcut("m", handleOpenFilter);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // Keep the field in sync when a new `defaultQuery` arrives without this
  // component remounting (e.g. client-side nav to a different `?q=` on the
  // search results page).
  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    if (!showPanel) return;

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || inputRef.current?.contains(target)) {
        return;
      }
      setSuggestOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showPanel]);

  const goToResult = useCallback(
    (result: SearchResult) => {
      setSuggestOpen(false);
      router.push(resultHref(result));
    },
    [router]
  );

  return (
    <form
      ref={formRef}
      action="/search"
      role="search"
      className={`group relative flex h-14 w-full items-center rounded-full border border-white/20 bg-white/95 pl-6 pr-1.5 focus-within:ring-2 focus-within:ring-accent ${className}`}
    >
      <div className="relative flex min-w-0 flex-1 items-center">
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={query}
          placeholder="Search documents, reports, videos…"
          aria-label="Search the resource hub"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setSuggestOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setSuggestOpen(true);
          }}
          onKeyDown={(e) => {
            if (!showPanel) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => (i + 1) % results.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => (i - 1 + results.length) % results.length);
            } else if (e.key === "Enter") {
              if (activeIndex >= 0 && results[activeIndex]) {
                e.preventDefault();
                goToResult(results[activeIndex]);
              }
            } else if (e.key === "Escape") {
              setSuggestOpen(false);
            }
          }}
          className="h-full w-full min-w-0 bg-transparent pr-8 text-base text-foreground placeholder:text-muted focus:outline-none"
        />
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
          className="size-4.5 shrink-0"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="sr-only sm:not-sr-only">Search</span>
      </button>

      {showPanel && (
        <div
          ref={panelRef}
          id={listboxId}
          role="listbox"
          aria-label="Instant search results"
          className="animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 absolute inset-x-0 top-[calc(100%+0.75rem)] z-50 origin-top overflow-hidden rounded-2xl border border-border/60 bg-white text-left shadow-2xl duration-150"
        >
          <ul className="max-h-88 divide-y divide-border/60 overflow-y-auto">
            {results.map((result, index) => {
              const meta = resultMeta(result);
              const active = index === activeIndex;
              return (
                <li key={`${result.kind}-${index}`} role="presentation">
                  <Link
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={active}
                    href={resultHref(result)}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => setSuggestOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3 text-left transition-colors",
                      active ? "bg-primary/5" : "hover:bg-surface-2"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full",
                        active ? "bg-primary/15 text-primary" : "bg-surface-2 text-muted"
                      )}
                    >
                      <Icon name={resultIcon(result)} className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {meta.title}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {meta.chip} · {meta.detail}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => {
              setSuggestOpen(false);
              formRef.current?.requestSubmit();
            }}
            className="flex w-full items-center justify-between gap-2 border-t border-border/60 bg-surface-2/60 px-5 py-3 text-left text-sm font-medium text-primary transition-colors hover:bg-surface-2"
          >
            <span>
              See all results for <span className="font-semibold">“{query.trim()}”</span>
            </span>
            <Icon name="arrow" className="size-4 shrink-0" />
          </button>
        </div>
      )}
    </form>
  );
}
