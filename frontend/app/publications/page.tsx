import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "../components/page-header";
import PublicationCover from "../components/publication-cover";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { publications, publicationRef } from "../lib/content";
import PublicationsRegister from "./register";

export const metadata: Metadata = {
  title: "Policies & publications",
  description:
    "Official policies, sector reports, and guidelines published by the Ministry of Education and Human Resources Development.",
};

export default function PublicationsIndexPage() {
  const featured = publications[0];

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-publications"
        eyebrow="Policies & publications"
        title="The Ministry's official record."
        lead="National policies, sector performance reports, and guidelines — every entry carries a registry reference, a summary page, and the full document to download."
        crumbs={[{ label: "Publications" }]}
      />

      <main className="flex-1 bg-background">
        {/* ---------- Latest release ---------- */}
        <section className="mx-auto w-full max-w-8xl px-6 pt-16">
          <article className="grid gap-10 rounded-3xl border border-border bg-surface p-8 sm:p-10 lg:grid-cols-[1fr_280px] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Latest release
              </p>
              <h2 className="mt-4 max-w-3xl font-serif text-3xl leading-snug tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                <Link
                  href={`/publications/${featured.slug}`}
                  className="hover:text-primary"
                >
                  {featured.title}
                </Link>
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                {featured.summary}
              </p>
              <p className="mt-4 font-mono text-xs text-muted">
                {publicationRef(featured)} · {featured.date} · {featured.office}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/publications/${featured.slug}`}
                  className={cn(buttonVariants({ variant: "primary" }), "text-sm")}
                >
                  Read the summary
                  <span aria-hidden>→</span>
                </Link>
                <a
                  href="#"
                  title="Download will be available once the CMS is connected"
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "text-sm",
                  )}
                >
                  <Icon name="download" className="size-4" />
                  Download {featured.format}
                  <span className="font-mono text-xs font-normal text-muted">
                    {featured.size}
                  </span>
                </a>
              </div>
            </div>

            {/* designed document cover */}
            <div className="hidden justify-self-center lg:block">
              <PublicationCover publication={featured} className="w-[260px]" />
            </div>
          </article>
        </section>

        {/* ---------- Register ---------- */}
        <section className="mx-auto w-full max-w-8xl px-6 py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                The register
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
                All publications, by year.
              </h2>
            </div>
          </div>
          <PublicationsRegister />
        </section>

        {/* ---------- Missing-publication CTA ---------- */}
        <section className="bg-surface">
          <div className="mx-auto flex w-full max-w-8xl flex-wrap items-center justify-between gap-6 px-6 py-12">
            <div>
              <h2 className="font-serif text-2xl text-foreground">
                Looking for a publication that isn&apos;t listed?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Older publications are still being digitised. The Ministry can
                help you locate printed or archived documents that haven&apos;t
                reached the register yet.
              </p>
            </div>
            <Link
              href="/about/contact"
              className={cn(buttonVariants({ variant: "primary" }), "text-sm")}
            >
              Contact the Ministry
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
