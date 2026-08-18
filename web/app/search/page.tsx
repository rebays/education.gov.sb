import type { Metadata } from "next";
import Link from "next/link";
import HeroSearch from "@/components/shared/hero-search";
import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { searchCms, type CmsSearchResult } from "@/lib/search";
import { categories, categoryHref, getCategory } from "../lib/content";

export const metadata: Metadata = {
  title: "Search",
  description: "Search documents, reports, videos, and news across the hub.",
};

function ResultChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
      {children}
    </span>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; level?: string; scope?: string }>;
}) {
  const { q = "", level = "", scope = "" } = await searchParams;
  const query = q.trim();
  const levelCategory = getCategory(level);
  const resourcesOnly = scope === "resources";

  let results: CmsSearchResult[] = [];
  let searchFailed = false;
  if (query) {
    try {
      /* a level or resources scope narrows to resource results; publications
         and news are sector-wide and not level-tagged, so a scoped search
         omits them */
      results = await searchCms(query, {
        level: levelCategory?.slug,
        resourcesOnly,
      });
    } catch {
      searchFailed = true;
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-search"
        title={query ? `Results for “${query}”` : "Search the hub."}
        crumbs={[{ label: "Search" }]}
      >
        <HeroSearch
          defaultQuery={query}
          defaultLevel={levelCategory?.slug ?? ""}
          className="mt-8 max-w-2xl"
        />
        {query && !searchFailed && (
          <p className="mt-5 text-sm text-white/70" aria-live="polite">
            {results.length} {results.length === 1 ? "result" : "results"}
            {levelCategory && (
              <>
                {" "}
                in <span className="text-white">{levelCategory.title}</span> ·{" "}
                <Link href={`/search?q=${encodeURIComponent(query)}`} className="underline hover:text-accent">
                  search all levels
                </Link>
              </>
            )}
            {!levelCategory && resourcesOnly && (
              <>
                {" "}
                in the <span className="text-white">Resource Library</span> ·{" "}
                <Link href={`/search?q=${encodeURIComponent(query)}`} className="underline hover:text-accent">
                  search everything
                </Link>
              </>
            )}
          </p>
        )}
      </PageHeader>

      <main className="flex-1 bg-background">
        <div className="mx-auto w-full max-w-8xl px-6 py-14">
          {/* results */}
          {query && results.length > 0 && (
            <ul className="divide-y divide-border">
              {results.map((result) => (
                <li key={`${result.kind}-${result.href}`} className="py-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <ResultChip>{result.chip}</ResultChip>
                    <span className="text-xs text-muted">{result.meta}</span>
                  </div>
                  <h2 className="mt-2 font-serif text-xl leading-snug">
                    <Link
                      href={result.href}
                      className="text-foreground hover:text-primary"
                    >
                      {result.title}
                    </Link>
                  </h2>
                  {result.summary && (
                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
                      {result.summary}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* search unavailable */}
          {query && searchFailed && (
            <div className="mx-auto max-w-xl py-10 text-center">
              <h2 className="font-serif text-2xl text-foreground">
                Search isn&apos;t available right now.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                We couldn&apos;t reach the content service. Try again in a
                moment, or browse by category below.
              </p>
            </div>
          )}

          {/* no results */}
          {query && !searchFailed && results.length === 0 && (
            <div className="mx-auto max-w-xl py-10 text-center">
              <h2 className="font-serif text-2xl text-foreground">
                {resourcesOnly || levelCategory
                  ? `No resources matched “${query}”.`
                  : `Nothing matched “${query}”.`}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {resourcesOnly || levelCategory ? (
                  <>
                    Try a shorter or more general term, browse by category
                    below — or{" "}
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      className="font-medium text-primary underline hover:no-underline"
                    >
                      search the whole site
                    </Link>{" "}
                    including publications and news.
                  </>
                ) : (
                  <>
                    Try a shorter or more general term — for example
                    “curriculum”, “exam”, or “report” — or browse by category
                    below.
                  </>
                )}
              </p>
            </div>
          )}

          {/* browse hints (empty query, no results, or search down) */}
          {(!query || searchFailed || results.length === 0) && (
            <div className={query ? "mt-4" : ""}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Browse instead
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={categoryHref(c.slug)}
                    className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                  >
                    <h3 className="font-serif text-lg text-foreground group-hover:text-primary">
                      {c.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted">
                      {c.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
