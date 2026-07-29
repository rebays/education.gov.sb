import Image from "next/image";
import Link from "next/link";
import CopyLink from "@/components/shared/copy-link";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import TraditionalWatermark from "@/components/shared/traditional-watermark";
import { PullQuote } from "@/components/ui/pull-quote";
import type {
  NewsBodyBlock,
  NewsCategory,
  NewsPage as NewsPageProps,
} from "./types";
import RelatedNews from "./RelatedNews";

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

function BodyBlock({ block }: { block: NewsBodyBlock }) {
  if (block.blockType === "RichTextBlock") {
    return (
      <div
        className="prose prose-slate max-w-none text-base leading-8 text-foreground/90"
        dangerouslySetInnerHTML={{ __html: block.value }}
      />
    );
  }
  const attribution = [block.attribution, block.role]
    .filter(Boolean)
    .join(", ");
  return (
    <PullQuote
      className="py-2"
      quote={block.quote}
      attribution={attribution || undefined}
    />
  );
}

export default function NewsPage(_: { page: NewsPageProps }) {
  const post = _.page;
  const category = categoryDisplay[post.category];
  const date = formatDisplayDate(post.date);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      {/* article hero — image, or the designed deep-blue fallback */}
      <section className="relative isolate flex min-h-[46svh] items-end overflow-hidden text-white">
        {post.image ? (
          <>
            <Image
              src={post.image.url}
              alt={post.image.title}
              fill
              priority
              sizes="100vw"
              className="-z-20 object-cover"
            />
            <div className="absolute inset-0 -z-10 scrim-hero" />
          </>
        ) : (
          <div className="absolute inset-0 -z-20 bg-deep">
            <TraditionalWatermark
              id={`wm-news-${post.slug}`}
              corners={["top-right", "bottom-left"]}
              className="z-0 text-white opacity-[0.05]"
            />
          </div>
        )}
        <div className="mx-auto w-full max-w-8xl px-6 pb-12 pt-28">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-white/60">
              <li>
                <Link href="/" className="hover:text-accent">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden>/</span>
                <Link href="/news-live" className="hover:text-accent">
                  News
                </Link>
              </li>
            </ol>
          </nav>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
              {category}
            </span>
            <span className="font-mono text-xs">{date}</span>
          </div>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            {post.title}
          </h1>
        </div>
      </section>

      <main className="flex-1 bg-background">
        <article className="mx-auto w-full max-w-8xl px-6 py-14">
          <div className="max-w-2xl">
            {/* byline */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
              <p className="text-sm text-muted">
                Published by{" "}
                <span className="font-semibold text-foreground">
                  Media &amp; Communications Unit
                </span>
              </p>
              <CopyLink />
            </div>

            <p className="border-l-2 border-accent pl-5 font-serif text-xl leading-8 text-foreground">
              {post.excerpt}
            </p>
            <div className="mt-8 space-y-6">
              {post.body.map((block) => (
                <BodyBlock key={block.id} block={block} />
              ))}
            </div>
            <div className="mt-10 border-t border-border pt-6 text-sm text-muted">
              Media enquiries:{" "}
              <Link
                href="/about/contact"
                className="font-semibold text-primary hover:underline"
              >
                Media &amp; Communications Unit
              </Link>
            </div>
          </div>
        </article>

        <RelatedNews category={post.category} currentSlug={post.slug} />
      </main>

      <SiteFooter />
    </div>
  );
}
