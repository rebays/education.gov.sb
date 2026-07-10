import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/shared/page-header";
import ResourceList from "@/components/shared/resource-list";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { FactSheet } from "@/components/ui/fact-sheet";
import {
  categoryHref,
  getCategory,
  getResource,
  getResourcesByCategory,
  resources,
  type Resource,
} from "../../../lib/content";

export function generateStaticParams() {
  return resources.map((r) => ({ category: r.category, slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const resource = getResource(category, slug);
  if (!resource) return {};
  return { title: resource.title, description: resource.summary };
}

/* ------------------------------------------------------------------ */
/*  Preview panel — a styled stand-in for the real file/video embed.   */
/*  When wired to the CMS this becomes an <object>/<iframe> for PDFs   */
/*  and a <video> player for media.                                    */
/* ------------------------------------------------------------------ */

function DocumentPreview({ resource }: { resource: Resource }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-sm">
      {/* viewer chrome */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2.5">
        <span className="truncate font-mono text-xs text-muted">
          {resource.slug}.{resource.format.toLowerCase()}
        </span>
        <span className="font-mono text-xs text-muted">
          Page 1{resource.pages ? ` of ${resource.pages}` : ""}
        </span>
      </div>
      {/* mock page */}
      <div className="flex justify-center px-6 py-8 sm:px-10 sm:py-10">
        <div className="aspect-[3/4] w-full max-w-md rounded-sm border border-border bg-white p-8 shadow-md sm:p-10">
          <div className="mx-auto h-10 w-10 rounded-full bg-primary/15" />
          <div className="mt-6 space-y-2">
            <div className="mx-auto h-3 w-3/4 rounded bg-foreground/15" />
            <div className="mx-auto h-3 w-1/2 rounded bg-foreground/15" />
          </div>
          <div className="mt-8 space-y-2.5">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="h-2 rounded bg-foreground/8"
                style={{ width: `${100 - (i % 4) * 9}%` }}
              />
            ))}
          </div>
          <div className="mt-8 space-y-2.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-2 rounded bg-foreground/8"
                style={{ width: `${92 - (i % 3) * 14}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="border-t border-border bg-background px-4 py-2.5 text-center text-xs text-muted">
        Document preview — download the file for the full {resource.format}.
      </p>
    </div>
  );
}

function VideoPreview({ resource }: { resource: Resource }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-deep shadow-sm">
      <div className="relative flex aspect-video items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground">
          <svg
            viewBox="0 0 24 24"
            className="ml-1 h-7 w-7 text-white"
            aria-hidden
            fill="currentColor"
          >
            <path d="m7 5 12 7-12 7z" />
          </svg>
        </span>
        <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 font-mono text-xs text-white">
          {resource.size}
        </span>
      </div>
      <p className="border-t border-white/10 px-4 py-2.5 text-center text-xs text-white/60">
        Video preview — streaming will be available once the media service is
        connected.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const resource = getResource(category, slug);
  const cat = getCategory(category);
  if (!resource || !cat) notFound();

  const isVideo = resource.kind === "Video";
  const related = getResourcesByCategory(resource.category)
    .filter((r) => r.slug !== resource.slug)
    .slice(0, 3);

  const facts: [string, string][] = [
    ["Type", resource.kind],
    ["Format", resource.format],
    [isVideo ? "Duration" : "File size", resource.size],
    ["Language", resource.language],
    ["Published", resource.published],
  ];
  if (resource.revised) facts.push(["Last revised", resource.revised]);
  if (resource.pages) facts.push(["Pages", String(resource.pages)]);
  facts.push(["Source office", resource.office]);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id={`wm-res-${resource.slug}`}
        title={resource.title}
        lead={resource.summary}
        crumbs={[
          { label: "Resources", href: "/resources" },
          { label: cat.shortTitle, href: categoryHref(cat.slug) },
          { label: resource.title },
        ]}
      />

      <main className="flex-1 bg-background">
        <div className="mx-auto grid w-full max-w-8xl gap-10 px-6 py-14 lg:grid-cols-[1fr_320px]">
          {/* preview */}
          <div>
            {isVideo ? (
              <VideoPreview resource={resource} />
            ) : (
              <DocumentPreview resource={resource} />
            )}
          </div>

          {/* metadata sidebar */}
          <aside className="lg:pt-1">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <a
                href="#"
                aria-disabled
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                {isVideo ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    aria-hidden
                    fill="currentColor"
                  >
                    <path d="m7 5 12 7-12 7z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    aria-hidden
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v12M7 11l5 4 5-4M5 21h14" />
                  </svg>
                )}
                {isVideo ? "Watch" : `Download ${resource.format}`}
                <span className="font-normal opacity-75">
                  · {resource.size}
                </span>
              </a>

              <FactSheet className="mt-6" facts={facts} />
            </div>

            <p className="mt-4 px-1 text-xs leading-5 text-muted">
              Every resource on the hub is published by the Ministry. If you
              find an error in this {isVideo ? "video" : "document"},{" "}
              <Link
                href="/about/contact"
                className="font-semibold text-primary hover:underline"
              >
                contact us
              </Link>
              .
            </p>
          </aside>
        </div>

        {/* related */}
        {related.length > 0 && (
          <section className="bg-surface">
            <div className="mx-auto w-full max-w-8xl px-6 py-14">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                More in {cat.shortTitle.toLowerCase()}
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground">
                Related resources.
              </h2>
              <div className="mt-8">
                <ResourceList items={related} />
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
