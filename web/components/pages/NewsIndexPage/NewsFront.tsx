"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { cmsClientFetch } from "@/lib/cms-client";
import {
  BriefsColumn,
  categoryVariant,
  HeadlineList,
  StoryCard,
  StoryImage,
} from "@/components/shared/news-cards";
import type { NewsCategory, NewsPost } from "@/app/lib/content";
import {
  NEWS_PAGES_QUERY,
  type NewsCategoryEnum,
  type NewsPagesQueryResult,
} from "./queries";

/**
 * The newsroom front page — broadsheet composition derived from recency:
 * one lead story, one band of five (two story cards + a three-item briefs
 * column on the right), then everything older as a plain headline list.
 * News is fetched from the CMS via /api/cms with cursor pagination; the
 * "More news" button appends the next page.
 */

const BAND_SIZE = 5; // 2 cards + 3 briefs
const BAND_COUNT = 1;
const INITIAL_PAGE_SIZE = 16; // lead (1) + band (5) + first 10 headlines
const LOAD_MORE_SIZE = 10;

type FilterValue = "All" | NewsCategory;

const filters: { label: string; value: FilterValue }[] = [
  { label: "All", value: "All" },
  { label: "Announcements", value: "Announcement" },
  { label: "Press releases", value: "Press release" },
  { label: "Events", value: "Event" },
];

const filterToEnum: Record<Exclude<FilterValue, "All">, NewsCategoryEnum> = {
  Announcement: "ANNOUNCEMENT",
  "Press release": "PRESS_RELEASE",
  Event: "EVENT",
};

const categoryFromCms: Record<
  NewsPagesQueryResult["newsPages"]["edges"][number]["node"]["category"],
  NewsCategory
> = {
  announcement: "Announcement",
  press_release: "Press release",
  event: "Event",
};

function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toNewsPost(
  node: NewsPagesQueryResult["newsPages"]["edges"][number]["node"],
): NewsPost {
  return {
    slug: node.slug,
    title: node.title,
    category: categoryFromCms[node.category],
    date: formatDisplayDate(node.date),
    excerpt: node.excerpt,
    image: node.image?.url,
    body: [],
    href: node.url ?? `/news-live/${node.slug}`,
  };
}

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

function NewsFrontSkeleton() {
  return (
    <div className="mt-10 space-y-8">
      <div className="grid gap-8 lg:grid-cols-5 lg:items-center">
        <Skeleton className="aspect-16/10 lg:col-span-3" />
        <div className="space-y-3 lg:col-span-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="grid gap-10 border-t border-border pt-10 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-16/10 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NewsFront() {
  const [active, setActive] = useState<FilterValue>("All");
  const [items, setItems] = useState<NewsPost[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (opts: { after?: string; append: boolean }) => {
      const category =
        active === "All" ? undefined : filterToEnum[active];
      const data = await cmsClientFetch<NewsPagesQueryResult>(NEWS_PAGES_QUERY, {
        first: opts.after ? LOAD_MORE_SIZE : INITIAL_PAGE_SIZE,
        after: opts.after ?? null,
        category: category ?? null,
      });
      const nextItems = data.newsPages.edges.map((e) => toNewsPost(e.node));
      setItems((prev) => (opts.append ? [...prev, ...nextItems] : nextItems));
      setEndCursor(data.newsPages.pageInfo.endCursor);
      setHasNextPage(data.newsPages.pageInfo.hasNextPage);
    },
    [active],
  );

  /* reset and fetch first page whenever the active filter changes */
  useEffect(() => {
    let cancelled = false;
    setInitialLoading(true);
    setError(null);
    fetchPage({ append: false })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load news");
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  async function loadMore() {
    if (!endCursor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      await fetchPage({ after: endCursor, append: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more news");
    } finally {
      setLoadingMore(false);
    }
  }

  const [lead, ...rest] = items;
  const bands = toBands(rest.slice(0, BAND_SIZE * BAND_COUNT));
  const headlines = rest.slice(BAND_SIZE * BAND_COUNT);

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
      </div>

      {initialLoading && <NewsFrontSkeleton />}

      {!initialLoading && error && items.length === 0 && (
        <p className="py-16 text-center text-sm text-muted">
          Couldn&apos;t load news right now. {error}
        </p>
      )}

      {!initialLoading && !error && items.length === 0 && (
        <p className="py-16 text-center text-sm text-muted">
          No stories in this category yet.
        </p>
      )}

      {/* lead story — image left, text right */}
      {lead && (
        <article className="mt-10 grid gap-8 pb-12 lg:grid-cols-5 lg:items-center">
          <Link
            href={lead.href ?? `/news/${lead.slug}`}
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
                href={lead.href ?? `/news/${lead.slug}`}
                className="text-foreground hover:text-primary"
              >
                {lead.title}
              </Link>
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              {lead.excerpt}
            </p>
            <Link
              href={lead.href ?? `/news/${lead.slug}`}
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            More news
          </p>
          <HeadlineList posts={headlines} />
        </section>
      )}

      {/* load more */}
      {!initialLoading && hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "text-sm disabled:opacity-60",
            )}
          >
            {loadingMore ? "Loading…" : "More news"}
          </button>
        </div>
      )}

      {error && items.length > 0 && (
        <p className="mt-4 text-center text-sm text-muted">
          Couldn&apos;t load more news. {error}
        </p>
      )}
    </div>
  );
}
