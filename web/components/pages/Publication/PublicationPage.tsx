import Link from "next/link";
import PageHeader from "@/components/shared/page-header";
import PublicationCover from "@/components/shared/publication-cover";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { buttonVariants } from "@/components/ui/button";
import { AtAGlance } from "@/components/ui/at-a-glance";
import { FactSheet } from "@/components/ui/fact-sheet";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { cmsFetch } from "@/lib/cms";
import {
  officeDisplay,
  publicationRefFor,
  publicationTypeDisplay,
  toPublicationSummary,
} from "./adapters";
import {
  PUBLICATIONS_QUERY,
  PUBLICATION_QUERY,
  type PublicationDetail,
  type PublicationListItem,
  type PublicationQueryResult,
  type PublicationsQueryResult,
} from "./queries";

export async function loadPublication(slug: string) {
  const [detail, list] = await Promise.all([
    cmsFetch<PublicationQueryResult>(PUBLICATION_QUERY, { slug }),
    cmsFetch<PublicationsQueryResult>(PUBLICATIONS_QUERY, {}),
  ]);
  return { pub: detail.publication, allItems: list.publications };
}

export default function PublicationPage({
  pub,
  allItems,
}: {
  pub: PublicationDetail;
  allItems: PublicationListItem[];
}) {
  const summary = toPublicationSummary(pub);
  const ref = publicationRefFor(pub, allItems);
  const newer = pub.newerEntry
    ? allItems.find((p) => p.slug === pub.newerEntry?.slug)
    : undefined;
  const related = pub.relatedPublicationItems;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id={`wm-pub-${pub.slug}`}
        title={pub.title}
        crumbs={[
          { label: "Publications", href: "/publications" },
          { label: pub.title },
        ]}
      >
        <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
          <span>{summary.date}</span>
          <span aria-hidden>·</span>
          <span>{summary.office}</span>
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
            {pub.keyPoints.length > 0 && (
              <AtAGlance
                className="mt-8"
                points={pub.keyPoints.map((kp) => kp.value)}
              />
            )}

            <div
              className="prose prose-slate mt-8 max-w-2xl text-base leading-8 text-foreground/90"
              dangerouslySetInnerHTML={{ __html: pub.body }}
            />

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
                    {publicationRefFor(newer, allItems)}
                  </p>
                </Link>
              </nav>
            )}
          </article>

          {/* record sidebar */}
          <aside className="lg:pt-1">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <PublicationCover
                publication={summary}
                reference={ref}
                className="w-full"
              />

              <a
                href={pub.url}
                download
                className={cn(
                  buttonVariants({ variant: "primary" }),
                  "mt-6 w-full text-sm",
                )}
              >
                <Icon name="download" className="size-4" />
                Download {summary.format}
                <span className="font-mono text-xs font-normal opacity-75">
                  {summary.size}
                </span>
              </a>
              <FactSheet
                className="mt-6"
                facts={[
                  ["Reference", ref],
                  ["Type", summary.type],
                  ["Published", summary.date],
                  ["Format", `${summary.format} · ${summary.size}`],
                  ["Source office", summary.office],
                ]}
              />
            </div>
          </aside>
        </div>

        {/* related publications */}
        {related.length > 0 && (
          <section className="bg-surface">
            <div className="mx-auto w-full max-w-8xl px-6 py-14">
              <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground">
                Related publications.
              </h2>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {related.map((p) => (
                  <RelatedPublicationCard key={p.slug} item={p} allItems={allItems} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function RelatedPublicationCard({
  item,
  allItems,
}: {
  item: PublicationListItem;
  allItems: PublicationListItem[];
}) {
  return (
    <Link
      href={`/publications/${item.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-primary">
        {publicationTypeDisplay[item.publicationType]}
      </span>
      <h3 className="mt-3 flex-1 font-serif text-lg leading-snug text-foreground group-hover:text-primary">
        {item.title}
      </h3>
      <p className="mt-4 text-xs text-muted">
        <span className="font-mono">{publicationRefFor(item, allItems)}</span> ·{" "}
        {officeDisplay[item.office] ?? item.office} · {item.fileExtension}
      </p>
    </Link>
  );
}
