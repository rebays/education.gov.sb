"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { cn } from "@/lib/utils";
import {
  BriefsColumn,
  categoryVariant,
  HeadlineList,
  StoryCard,
  StoryImage,
} from "@/components/shared/news-cards";
import { news, type NewsCategory, type NewsPost } from "../lib/content";

/**
 * The newsroom front page — broadsheet composition derived from recency:
 * one lead story, one band of five (two story cards + a three-item briefs
 * column on the right), then everything older as a plain headline list.
 * The list loads progressively: one auto-load near the bottom, then a
 * button. The CMS will later add an editorial "featured" flag for the lead.
 */

const BAND_SIZE = 5; // 2 cards + 3 briefs
const BAND_COUNT = 1;
const HEADLINES_INITIAL = 10;
const HEADLINES_PER_LOAD = 10;
const AUTO_LOADS = 1;

const filters: { label: string; value: "All" | NewsCategory }[] = [
  { label: "All", value: "All" },
  { label: "Announcements", value: "Announcement" },
  { label: "Press releases", value: "Press release" },
  { label: "Events", value: "Event" },
];

type Band = { cards: NewsPost[]; briefs: NewsPost[] };

function toBands(posts: NewsPost[]): Band[] {
  const bands: Band[] = [];
  for (let i = 0; i < posts.length; i += BAND_SIZE) {
    const chunk = posts.slice(i, i + BAND_SIZE);
    bands.push({ cards: chunk.slice(0, 2), briefs: chunk.slice(2) });
  }
  return bands;
}

function NewsBand({ band }: { band: Band }) {
  return (
    <div className="grid gap-10 border-t border-border pt-10 lg:grid-cols-3">
      {band.cards.map((story) => (
        <StoryCard key={story.slug} story={story} />
      ))}
      {band.briefs.length > 0 && (
        <BriefsColumn
          briefs={band.briefs}
          className="lg:border-l lg:border-border lg:pl-10"
        />
      )}
    </div>
  );
}

export default function NewsFrontPage() {
  const [active, setActive] = useState<"All" | NewsCategory>("All");
  const [visibleHeadlines, setVisibleHeadlines] = useState(HEADLINES_INITIAL);
  const [autoLoadsUsed, setAutoLoadsUsed] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const sorted = [...news].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date),
  );
  const filtered =
    active === "All" ? sorted : sorted.filter((n) => n.category === active);

  const [lead, ...rest] = filtered;
  const bands = toBands(rest.slice(0, BAND_SIZE * BAND_COUNT));
  const headlines = rest.slice(BAND_SIZE * BAND_COUNT);
  const shownHeadlines = headlines.slice(0, visibleHeadlines);
  const hasMore = visibleHeadlines < headlines.length;
  const autoLoading = hasMore && autoLoadsUsed < AUTO_LOADS;

  /* reset progressive loading whenever the composition changes */
  function resetLoading() {
    setVisibleHeadlines(HEADLINES_INITIAL);
    setAutoLoadsUsed(0);
  }

  /* auto-load more headlines as the sentinel approaches the viewport */
  useEffect(() => {
    if (!autoLoading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleHeadlines((v) => v + HEADLINES_PER_LOAD);
          setAutoLoadsUsed((n) => n + 1);
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoLoading]);

  return (
    <div>
      {/* filter bar */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3 border-b border-border pb-4">
        {filters.map((f) => (
          <FilterChip
            key={f.value}
            active={active === f.value}
            onClick={() => {
              setActive(f.value);
              resetLoading();
            }}
          >
            {f.label}
          </FilterChip>
        ))}

      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-muted">
          No stories in this category yet.
        </p>
      )}

      {/* lead story — image left, text right */}
      {lead && (
        <article className="mt-10 grid gap-8 pb-12 lg:grid-cols-5 lg:items-center">
          <Link
            href={`/news/${lead.slug}`}
            className="group relative block aspect-16/10 overflow-hidden rounded-2xl border border-border lg:col-span-3"
            tabIndex={-1}
            aria-hidden
          >
            <StoryImage
              story={lead}
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
            />
          </Link>
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={categoryVariant[lead.category]}>
                {lead.category}
              </Badge>
              <span className="font-mono text-xs text-muted">{lead.date}</span>
            </div>
            <h2 className="mt-4 font-serif text-3xl leading-[1.12] tracking-tight sm:text-4xl xl:text-5xl">
              <Link
                href={`/news/${lead.slug}`}
                className="text-foreground hover:text-primary"
              >
                {lead.title}
              </Link>
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              {lead.excerpt}
            </p>
            <Link
              href={`/news/${lead.slug}`}
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Read the story
              <span
                className="transition-transform group-hover:translate-x-1"
                aria-hidden
              >
                →
              </span>
            </Link>
          </div>
        </article>
      )}

      {/* broadsheet band — cards + briefs right */}
      <div className="space-y-12">
        {bands.map((band, i) => (
          <NewsBand key={i} band={band} />
        ))}
      </div>

      {/* headline list — everything older */}
      {headlines.length > 0 && (
        <section aria-label="More news" className="mt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">
            More news
          </p>
          <HeadlineList posts={shownHeadlines} />

          {/* progressive loading: sentinel for auto-load, then a button */}
          {autoLoading && (
            <div ref={sentinelRef} aria-hidden className="h-px" />
          )}
          {hasMore && !autoLoading && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleHeadlines((v) => v + HEADLINES_PER_LOAD)
                }
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "text-sm",
                )}
              >
                More news
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
