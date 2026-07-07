"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import TraditionalWatermark from "../components/traditional-watermark";
import { news, type NewsCategory, type NewsPost } from "../lib/content";

/**
 * The newsroom front page — broadsheet-style editorial hierarchy derived
 * from recency: one lead story, a second tier of two, and a text-only
 * "In brief" column for everything else (no image dependence, scales to
 * any volume). The CMS will later add an editorial "featured" flag so
 * staff can choose the lead.
 */

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

export default function NewsFrontPage() {
  const [active, setActive] = useState<"All" | NewsCategory>("All");

  const sorted = [...news].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date),
  );
  const filtered =
    active === "All" ? sorted : sorted.filter((n) => n.category === active);

  const [lead, ...rest] = filtered;
  const second = rest.slice(0, 2);
  const briefs = rest.slice(2);

  return (
    <div>
      {/* filter bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
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
        <span className="ml-auto text-sm text-muted" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "story" : "stories"}
        </span>
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-muted">
          No stories in this category yet.
        </p>
      )}

      {/* lead story */}
      {lead && (
        <article className="mt-10 grid gap-8 border-b border-border pb-12 lg:grid-cols-5 lg:items-center">
          <Link
            href={`/news/${lead.slug}`}
            className="group relative block aspect-[16/10] overflow-hidden rounded-2xl border border-border lg:col-span-3"
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

      {/* second tier + briefs column */}
      {(second.length > 0 || briefs.length > 0) && (
        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          {second.map((story) => (
            <article key={story.slug}>
              <Link
                href={`/news/${story.slug}`}
                className="group relative block aspect-[16/10] overflow-hidden rounded-2xl border border-border"
                tabIndex={-1}
                aria-hidden
              >
                <StoryImage
                  story={story}
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
              </Link>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Badge variant={categoryVariant[story.category]}>
                  {story.category}
                </Badge>
                <span className="font-mono text-xs text-muted">
                  {story.date}
                </span>
              </div>
              <h3 className="mt-3 font-serif text-2xl leading-snug">
                <Link
                  href={`/news/${story.slug}`}
                  className="text-foreground hover:text-primary"
                >
                  {story.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {story.excerpt}
              </p>
            </article>
          ))}

          {briefs.length > 0 && (
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
                      <span className="font-mono text-xs text-muted">
                        {b.date}
                      </span>
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
          )}
        </div>
      )}
    </div>
  );
}
