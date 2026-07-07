import Image from "next/image";
import Link from "next/link";
import TraditionalWatermark from "./traditional-watermark";
import { Badge } from "@/components/ui/badge";
import { news, type NewsCategory } from "../lib/content";

const categoryVariant: Record<
  NewsCategory,
  "primary" | "success" | "warning"
> = {
  Announcement: "primary",
  "Press release": "success",
  Event: "warning",
};

/**
 * Landing-page news section — the newsroom's front-page grammar,
 * miniaturized: the featured story on the left (≈2/3), a text-only
 * "In brief" column on the right behind a hairline rule. The full
 * newsroom lives at /news.
 */
export default function NewsBanner() {
  const sorted = [...news].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date),
  );
  const [featured, ...rest] = sorted;
  if (!featured) return null;
  const briefs = rest.slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-8xl px-6 py-24">
      <h2 className="font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
        Latest from iResource.
      </h2>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        {/* featured story — ≈2/3, styled like the curriculum-section cards */}
        <Link
          href={`/news/${featured.slug}`}
          className="group relative aspect-[16/9] overflow-hidden rounded-2xl border border-border shadow-sm transition-all hover:-translate-y-1.5 hover:border-accent hover:shadow-xl lg:col-span-2"
        >
          {featured.image ? (
            <>
              <Image
                src={featured.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
              {/* brand-blue scrim — solid text zone, fades out around 82% so the badge sits inside the dark band */}
              <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--deep)_0%,var(--deep)_22%,rgba(13,31,60,0.92)_32%,rgba(13,31,60,0.78)_42%,rgba(13,31,60,0.6)_52%,rgba(13,31,60,0.4)_62%,rgba(13,31,60,0.2)_72%,rgba(13,31,60,0)_82%)]" />
            </>
          ) : (
            <div className="relative isolate flex h-full w-full items-center justify-center overflow-hidden bg-deep">
              <TraditionalWatermark
                id="wm-news-featured"
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
          )}
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">
            In brief
          </p>
          <ul className="mt-2 divide-y divide-border">
            {briefs.map((b) => (
              <li key={b.slug} className="py-4">
                <p className="font-mono text-xs text-muted">{b.date}</p>
                <h4 className="mt-1.5 font-serif text-lg leading-snug">
                  <Link
                    href={`/news/${b.slug}`}
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
