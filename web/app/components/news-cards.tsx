import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import TraditionalWatermark from "./traditional-watermark";
import type { NewsCategory, NewsPost } from "../lib/content";

/**
 * The newsroom's shared story surfaces: the image-led story card, the
 * text-only briefs column, and the plain headline list — used by the news
 * front page and the landing page's newsroom section.
 */

export const categoryVariant: Record<
  NewsCategory,
  "primary" | "success" | "warning"
> = {
  Announcement: "primary",
  "Press release": "success",
  Event: "warning",
};

/** Story image, or the designed deep-blue fallback for text-only stories. */
export function StoryImage({
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
          src="/coat-of-arms.png"
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

/** The image-led news card: 16:10 photo, badge + mono date, serif headline. */
export function StoryCard({ story }: { story: NewsPost }) {
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

/** Text-only briefs: mono date, category tag, serif headline, one-line excerpt. */
export function BriefsColumn({
  briefs,
  className = "",
}: {
  briefs: NewsPost[];
  className?: string;
}) {
  return (
    <aside aria-label="News in brief" className={className}>
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

/** The "More news" rows: serif headline left, mono date and category right. */
export function HeadlineList({ posts }: { posts: NewsPost[] }) {
  return (
    <ul className="mt-3 divide-y divide-border border-t border-border">
      {posts.map((n) => (
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
  );
}
