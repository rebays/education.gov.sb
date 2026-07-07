"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TraditionalWatermark from "../components/traditional-watermark";
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

const categoryVariant: Record<
  NewsCategory,
  "primary" | "success" | "warning"
> = {
  Announcement: "primary",
  "Press release": "success",
  Event: "warning",
};

type Band = { cards: NewsPost[]; briefs: NewsPost[] };

function toBands(posts: NewsPost[]): Band[] {
  const bands: Band[] = [];
  for (let i = 0; i < posts.length; i += BAND_SIZE) {
    const chunk = posts.slice(i, i + BAND_SIZE);
    bands.push({ cards: chunk.slice(0, 2), briefs: chunk.slice(2) });
  }
  return bands;
}

/** Story image, or the designed deep-blue fallback for text-only stories. */
function StoryImage({
  story,
  sizes,
  priority = false,
}: {
  story: NewsPost;
  sizes: string;
  priority?: boolean;
}) {
  if (!story.image) {
    return (
      <div className="relative isolate flex h-full w-full items-center justify-center overflow-hidden bg-deep">
        <TraditionalWatermark
          id={`wm-story-${story.slug}`}
          corners={["top-right", "bottom-left"]}
          className="z-0 text-white opacity-[0.06]"
        />
        <Image
          src="/coa-si.webp"
          alt=""
          width={56}
          height={56}
          className="h-14 w-auto opacity-80"
        />
      </div>
    );
  }
  return (
    <Image
      src={story.image}
      alt=""
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

function StoryCard({ story }: { story: NewsPost }) {
  return (
    <article>
      <Link
        href={`/news/${story.slug}`}
        className="group relative block aspect-[16/10] overflow-hidden rounded-2xl border border-border"
        tabIndex={-1}
        aria-hidden
      >
        <StoryImage story={story} sizes="(min-width: 1024px) 33vw, 100vw" />
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Badge variant={categoryVariant[story.category]}>
          {story.category}
        </Badge>
        <span className="font-mono text-xs text-muted">{story.date}</span>
      </div>
      <h3 className="mt-3 font-serif text-2xl leading-snug">
        <Link
          href={`/news/${story.slug}`}
          className="text-foreground hover:text-primary"
        >
          {story.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted">{story.excerpt}</p>
    </article>
  );
}

function BriefsColumn({ briefs }: { briefs: NewsPost[] }) {
  return (
    <aside
      aria-label="News in brief"
      className="lg:border-l lg:border-border lg:pl-10"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">
        In brief
      </p>
      <ul className="mt-2 divide-y divide-border">
        {briefs.map((b) => (
          <li key={b.slug} className="py-5">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-mono text-xs text-muted">{b.date}</span>
              <span className="text-xs font-semibold text-primary">
                {b.category}
              </span>
            </p>
            <h4 className="mt-1.5 font-serif text-lg leading-snug">
              <Link
                href={`/news/${b.slug}`}
                className="text-foreground hover:text-primary"
              >
                {b.title}
              </Link>
            </h4>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
              {b.excerpt}
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function NewsBand({ band }: { band: Band }) {
  return (
    <div className="grid gap-10 border-t border-border pt-10 lg:grid-cols-3">
      {band.cards.map((story) => (
        <StoryCard key={story.slug} story={story} />
      ))}
      {band.briefs.length > 0 && <BriefsColumn briefs={band.briefs} />}
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
        {filters.map((f) => {
          const isActive = active === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setActive(f.value);
                resetLoading();
              }}
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
          <ul className="mt-3 divide-y divide-border border-t border-border">
            {shownHeadlines.map((n) => (
              <li key={n.slug}>
                <Link
                  href={`/news/${n.slug}`}
                  className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5"
                >
                  <h4 className="min-w-0 font-serif text-lg leading-snug text-foreground group-hover:text-primary">
                    {n.title}
                  </h4>
                  <span className="shrink-0 text-xs text-muted">
                    <span className="font-mono">{n.date}</span> · {n.category}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

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
