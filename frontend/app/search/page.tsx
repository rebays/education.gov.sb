import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "../components/page-header";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";
import {
  categories,
  getCategory,
  resourceHref,
  searchContent,
} from "../lib/content";

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
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? searchContent(query) : [];

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-search"
        title={query ? `Results for “${query}”` : "Search the hub."}
        crumbs={[{ label: "Search" }]}
      >
        <form
          action="/search"
          role="search"
          className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
        >
          <input
            key={query}
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search documents, reports, videos…"
            aria-label="Search the resource hub"
            className="h-12 flex-1 rounded-lg border border-white/20 bg-white/95 px-4 text-base text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="h-12 rounded-lg bg-accent px-6 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]"
          >
            Search
          </button>
        </form>
        {query && (
          <p className="mt-5 text-sm text-white/70" aria-live="polite">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
        )}
      </PageHeader>

      <main className="flex-1 bg-background">
        <div className="mx-auto w-full max-w-8xl px-6 py-14">
          {/* results */}
          {query && results.length > 0 && (
            <ul className="divide-y divide-border">
              {results.map((result) => {
                if (result.kind === "resource") {
                  const r = result.item;
                  const cat = getCategory(r.category);
                  return (
                    <li key={`res-${r.category}-${r.slug}`} className="py-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <ResultChip>{cat?.shortTitle ?? "Resource"}</ResultChip>
                        <span className="text-xs text-muted">
                          {r.kind} · {r.published} · {r.format} · {r.size}
                        </span>
                      </div>
                      <h2 className="mt-2 font-serif text-xl leading-snug">
                        <Link
                          href={resourceHref(r)}
                          className="text-foreground hover:text-primary"
                        >
                          {r.title}
                        </Link>
                      </h2>
                      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
                        {r.summary}
                      </p>
                    </li>
                  );
                }
                if (result.kind === "publication") {
                  const p = result.item;
                  return (
                    <li key={`pub-${p.slug}`} className="py-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <ResultChip>Publication</ResultChip>
                        <span className="text-xs text-muted">
                          {p.type} · {p.date} · {p.format} · {p.size}
                        </span>
                      </div>
                      <h2 className="mt-2 font-serif text-xl leading-snug">
                        <Link
                          href={`/publications/${p.slug}`}
                          className="text-foreground hover:text-primary"
                        >
                          {p.title}
                        </Link>
                      </h2>
                      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
                        {p.summary}
                      </p>
                    </li>
                  );
                }
                const n = result.item;
                return (
                  <li key={`news-${n.slug}`} className="py-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <ResultChip>News</ResultChip>
                      <span className="text-xs text-muted">
                        {n.category} · {n.date}
                      </span>
                    </div>
                    <h2 className="mt-2 font-serif text-xl leading-snug">
                      <Link
                        href={`/news/${n.slug}`}
                        className="text-foreground hover:text-primary"
                      >
                        {n.title}
                      </Link>
                    </h2>
                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
                      {n.excerpt}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}

          {/* no results */}
          {query && results.length === 0 && (
            <div className="mx-auto max-w-xl py-10 text-center">
              <h2 className="font-serif text-2xl text-foreground">
                Nothing matched “{query}”.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Try a shorter or more general term — for example
                “curriculum”, “exam”, or “report” — or browse by category
                below.
              </p>
            </div>
          )}

          {/* browse hints (empty query or no results) */}
          {(!query || results.length === 0) && (
            <div className={query ? "mt-4" : ""}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Browse instead
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/resources/${c.slug}`}
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
