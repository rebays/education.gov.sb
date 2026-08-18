import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { categoryVariant, StoryImage } from "./news-cards";
import { cmsFetch } from "@/lib/cms";
import { toNewsPost } from "@/components/pages/NewsIndexPage/adapters";
import {
  NEWS_PAGES_QUERY,
  type NewsPagesQueryResult,
} from "@/components/pages/NewsIndexPage/queries";
import type { NewsPost } from "@/app/lib/content";

/** Lead story + five briefs. */
const BANNER_SIZE = 6;

/**
 * Landing-page news section — the newsroom's front-page grammar,
 * miniaturized: the featured story on the left (≈2/3), a text-only
 * "In brief" column on the right behind a hairline rule. Stories come
 * newest-first from the CMS; the full newsroom lives at /news.
 */
export default async function NewsBanner() {
  let posts: NewsPost[];
  try {
    const data = await cmsFetch<NewsPagesQueryResult>(NEWS_PAGES_QUERY, {
      first: BANNER_SIZE,
    });
    posts = data.newsPages.edges.map((edge) => toNewsPost(edge.node));
  } catch {
    // The landing page shouldn't fall over with the CMS: skip the section.
    return null;
  }

  const [featured, ...briefs] = posts;
  if (!featured) return null;

  return (
    <div className="mx-auto w-full max-w-8xl px-6 py-24">
      <h2 className="font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
        Latest from the Ministry.
      </h2>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        {/* featured story — ≈2/3, styled like the curriculum-section cards */}
        <Link
          href={featured.href ?? `/news/${featured.slug}`}
          className="group relative aspect-[16/9] overflow-hidden rounded-2xl border border-border shadow-sm transition-all hover:-translate-y-1.5 hover:border-accent hover:shadow-xl lg:col-span-2"
        >
          <StoryImage
            story={featured}
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
          {featured.image && <div className="absolute inset-0 scrim-banner" />}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant={categoryVariant[featured.category]}
                className="border border-white/25 bg-white/10 text-white backdrop-blur-md"
              >
                {featured.category}
              </Badge>
              <span className="font-mono text-xs text-white/80">
                {featured.date}
              </span>
            </div>
            <h3 className="mt-3 font-serif text-2xl leading-snug text-white transition-colors group-hover:text-accent sm:text-3xl">
              {featured.title}
            </h3>
            <p className="mt-2 line-clamp-1 text-base leading-7 text-white/85">
              {featured.excerpt}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 underline decoration-white/40 underline-offset-4 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
              Read the story
              <span
                className="transition-transform group-hover:translate-x-1"
                aria-hidden
              >
                →
              </span>
            </span>
          </div>
        </Link>

        {/* in brief — ≈1/3, behind a column rule */}
        <aside
          aria-label="News in brief"
          className="lg:border-l lg:border-border lg:pl-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            In brief
          </p>
          <ul className="mt-2 divide-y divide-border">
            {briefs.map((b) => (
              <li key={b.slug} className="py-4">
                <p className="font-mono text-xs text-muted">{b.date}</p>
                <h4 className="mt-1.5 font-serif text-lg leading-snug">
                  <Link
                    href={b.href ?? `/news/${b.slug}`}
                    className="text-foreground hover:text-primary"
                  >
                    {b.title}
                  </Link>
                </h4>
              </li>
            ))}
          </ul>
          <Link
            href="/news"
            className="group mt-6 inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
          >
            All news
            <span
              className="transition-transform group-hover:translate-x-1"
              aria-hidden
            >
              →
            </span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
