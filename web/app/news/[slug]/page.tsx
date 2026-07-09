import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyLink from "../../components/copy-link";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import TraditionalWatermark from "../../components/traditional-watermark";
import { PullQuote } from "@/components/ui/pull-quote";
import { getNewsPost, news } from "../../lib/content";

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getNewsPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

/* Body blocks: "## " → section heading, "> " → pull quote ("quote|attribution") */
function BodyBlock({ block }: { block: string }) {
  if (block.startsWith("## ")) {
    return (
      <h2 className="pt-4 font-serif text-2xl tracking-tight text-foreground">
        {block.slice(3)}
      </h2>
    );
  }
  if (block.startsWith("> ")) {
    const [quote, attribution] = block.slice(2).split("|");
    return (
      <PullQuote
        className="py-2"
        quote={quote.trim()}
        attribution={attribution?.trim()}
      />
    );
  }
  return <p className="text-base leading-8 text-foreground/90">{block}</p>;
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getNewsPost(slug);
  if (!post) notFound();

  /* same category first, then the rest — both newest-first */
  const others = news.filter((n) => n.slug !== post.slug);
  const more = [
    ...others.filter((n) => n.category === post.category),
    ...others.filter((n) => n.category !== post.category),
  ].slice(0, 3);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      {/* article hero — image, or the designed deep-blue fallback */}
      <section className="relative isolate flex min-h-[46svh] items-end overflow-hidden text-white">
        {post.image ? (
          <>
            <Image
              src={post.image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="-z-20 object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(8,20,40,0.92),rgba(8,20,40,0.45)_55%,rgba(8,20,40,0.25))]" />
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
                <Link href="/news" className="hover:text-accent">
                  News
                </Link>
              </li>
            </ol>
          </nav>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
              {post.category}
            </span>
            <span className="font-mono text-xs">{post.date}</span>
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
              {post.body.map((block, i) => (
                <BodyBlock key={i} block={block} />
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

        {/* more news — same category first */}
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
                href="/news"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                All news
                <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {more.map((n) => (
                <Link
                  key={n.slug}
                  href={`/news/${n.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                >
                  <p className="text-xs text-muted">
                    {n.category} · <span className="font-mono">{n.date}</span>
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
      </main>

      <SiteFooter />
    </div>
  );
}
