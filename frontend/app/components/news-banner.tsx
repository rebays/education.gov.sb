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
  const briefs = rest.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-8xl px-6 py-24">
      <h2 className="font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
        From the newsroom.
      </h2>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        {/* featured story — ≈2/3 */}
        <Link
          href={`/news/${featured.slug}`}
          className="group lg:col-span-2"
        >
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
            {featured.image ? (
              <>
                <Image
                  src={featured.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
                {/* brand-blue scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-deep/60 via-deep/15 to-transparent" />
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
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Badge variant={categoryVariant[featured.category]}>
              {featured.category}
            </Badge>
            <span className="font-mono text-xs text-muted">
              {featured.date}
            </span>
          </div>
          <h3 className="mt-3 font-serif text-2xl leading-snug text-foreground transition-colors group-hover:text-primary sm:text-3xl">
            {featured.title}
          </h3>
          <p className="mt-2 line-clamp-1 text-base leading-7 text-muted">
            {featured.excerpt}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Read the story
            <span
              className="transition-transform group-hover:translate-x-1"
              aria-hidden
            >
              →
            </span>
          </span>
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
