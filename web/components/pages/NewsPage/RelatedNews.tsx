"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cmsClientFetch } from "@/lib/cms-client";
import { RELATED_NEWS_QUERY, type RelatedNewsQueryResult } from "./queries";
import type { NewsCategory } from "./types";

const categoryDisplay: Record<NewsCategory, string> = {
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

type Item = RelatedNewsQueryResult["newsPages"]["edges"][number]["node"];

export default function RelatedNews({
  category,
  currentSlug,
}: {
  category: NewsCategory;
  currentSlug: string;
}) {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    cmsClientFetch<RelatedNewsQueryResult>(RELATED_NEWS_QUERY, { first: 15 })
      .then((data) => {
        if (cancelled) return;
        const others = data.newsPages.edges
          .map((e) => e.node)
          .filter((n) => n.slug !== currentSlug);
        const same = others.filter((n) => n.category === category);
        const rest = others.filter((n) => n.category !== category);
        setItems([...same, ...rest].slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [category, currentSlug]);

  return (
    <section className="bg-surface">
      <div className="mx-auto w-full max-w-8xl px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Newsroom
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground">
              More news.
            </h2>
          </div>
          <Link
            href="/news-live"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            All news
            <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {items === null &&
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-background p-6 shadow-sm"
              >
                <Skeleton className="h-3 w-32" />
                <Skeleton className="mt-3 h-6 w-full" />
                <Skeleton className="mt-2 h-6 w-3/4" />
                <Skeleton className="mt-6 h-4 w-16" />
              </div>
            ))}
          {items?.map((n) => (
            <Link
              key={n.slug}
              href={n.url ?? `/news-live/${n.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
            >
              <p className="text-xs text-muted">
                {categoryDisplay[n.category]} ·{" "}
                <span className="font-mono">{formatDisplayDate(n.date)}</span>
              </p>
              <h3 className="mt-2 flex-1 font-serif text-lg leading-snug text-foreground group-hover:text-primary">
                {n.title}
              </h3>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Read
                <span
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
