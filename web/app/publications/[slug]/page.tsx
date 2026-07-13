import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/shared/page-header";
import PublicationCover from "@/components/shared/publication-cover";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { buttonVariants } from "@/components/ui/button";
import { AtAGlance } from "@/components/ui/at-a-glance";
import { FactSheet } from "@/components/ui/fact-sheet";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  getPublication,
  publicationRef,
  publications,
} from "../../lib/content";

export function generateStaticParams() {
  return publications.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pub = getPublication(slug);
  if (!pub) return {};
  return { title: pub.title, description: pub.summary };
}

export default async function PublicationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pub = getPublication(slug);
  if (!pub) notFound();

  const ref = publicationRef(pub);

  /* next chronological entry in the register */
  const ordered = [...publications].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date),
  );
  const idx = ordered.findIndex((p) => p.slug === pub.slug);
  const newer = idx > 0 ? ordered[idx - 1] : undefined;

  const related = publications.filter((p) => p.slug !== pub.slug).slice(0, 3);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id={`wm-pub-${pub.slug}`}
        title={pub.title}
        crumbs={[{ label: "Publications", href: "/publications" }, { label: ref }]}
      >
        <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
          <span className="font-mono">{ref}</span>
          <span aria-hidden>·</span>
          <span>{pub.date}</span>
          <span aria-hidden>·</span>
          <span>{pub.office}</span>
        </p>
      </PageHeader>

      <main className="flex-1 bg-background">
        <div className="mx-auto grid w-full max-w-8xl gap-10 px-6 py-14 lg:grid-cols-[1fr_320px]">
          {/* record body */}
          <article>
            <p className="max-w-2xl border-l-2 border-accent pl-5 font-serif text-xl leading-8 text-foreground">
              {pub.summary}
            </p>

            {/* at a glance */}
            {pub.keyPoints && pub.keyPoints.length > 0 && (
              <AtAGlance className="mt-8" points={pub.keyPoints} />
            )}

            <div className="mt-8 max-w-2xl space-y-6">
              {pub.body.map((block, i) =>
                block.startsWith("## ") ? (
                  <h2
                    key={i}
                    className="pt-4 font-serif text-2xl tracking-tight text-foreground"
                  >
                    {block.slice(3)}
                  </h2>
                ) : (
                  <p key={i} className="text-base leading-8 text-foreground/90">
                    {block}
                  </p>
                ),
              )}
            </div>

            {/* next chronological entry */}
            {newer && (
              <nav
                aria-label="Register navigation"
                className="mt-12 max-w-2xl border-t border-border pt-8"
              >
                <Link
                  href={`/publications/${newer.slug}`}
                  className="group block rounded-2xl border border-border p-5 transition-colors hover:border-primary"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Newer entry →
                  </p>
                  <p className="mt-2 font-serif text-base leading-snug text-foreground group-hover:text-primary">
                    {newer.title}
                  </p>
                  <p className="mt-2 font-mono text-xs text-muted">
                    {publicationRef(newer)}
                  </p>
                </Link>
              </nav>
            )}
          </article>

          {/* record sidebar */}
          <aside className="lg:pt-1">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <PublicationCover publication={pub} className="w-full" />

              <a
                href="#"
                title="Download will be available once the CMS is connected"
                className={cn(
                  buttonVariants({ variant: "primary" }),
                  "mt-6 w-full text-sm",
                )}
              >
                <Icon name="download" className="size-4" />
                Download {pub.format}
                <span className="font-mono text-xs font-normal opacity-75">
                  {pub.size}
                </span>
              </a>
              <FactSheet
                className="mt-6"
                facts={[
                  ["Reference", ref],
                  ["Type", pub.type],
                  ["Published", pub.date],
                  ["Format", `${pub.format} · ${pub.size}`],
                  ["Source office", pub.office],
                ]}
              />
            </div>
          </aside>
        </div>

        {/* related publications */}
        <section className="bg-surface">
          <div className="mx-auto w-full max-w-8xl px-6 py-14">
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground">
              Related publications.
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/publications/${p.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {p.type}
                  </span>
                  <h3 className="mt-3 flex-1 font-serif text-lg leading-snug text-foreground group-hover:text-primary">
                    {p.title}
                  </h3>
                  <p className="mt-4 text-xs text-muted">
                    <span className="font-mono">{publicationRef(p)}</span> ·{" "}
                    {p.date} · {p.format}
                  </p>
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
