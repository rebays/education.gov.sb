import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "../../components/page-header";
import ResourceList from "../../components/resource-list";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import {
  categories,
  getCategory,
  getResourcesByCategory,
} from "../../lib/content";

/**
 * There is no per-category listing page. Old /resources/<category> URLs
 * land on the resource index, pre-filtered to the matching curriculum level.
 */
export default async function ResourceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const items = getResourcesByCategory(cat.slug);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id={`wm-cat-${cat.slug}`}
        title={cat.title}
        lead={cat.description}
        crumbs={[{ label: "Resources", href: "/resources" }, { label: cat.shortTitle }]}
      />

      <main className="flex-1 bg-background">
        <div className="mx-auto grid w-full max-w-8xl gap-12 px-6 py-16 lg:grid-cols-[220px_1fr]">
          {/* category nav */}
          <aside>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Categories
            </p>
            <ul className="mt-4 space-y-1 border-l border-border">
              {categories.map((c) => {
                const isActive = c.slug === cat.slug;
                return (
                  <li key={c.slug}>
                    <Link
                      href={`/resources/${c.slug}`}
                      aria-current={isActive ? "page" : undefined}
                      className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors ${
                        isActive
                          ? "border-primary font-semibold text-primary"
                          : "border-transparent text-muted hover:border-border hover:text-foreground"
                      }`}
                    >
                      {c.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* listing */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <p className="text-sm text-muted" aria-live="polite">
                {items.length} {items.length === 1 ? "resource" : "resources"}
              </p>
              <form action="/search" role="search" className="flex gap-2">
                <input
                  type="search"
                  name="q"
                  placeholder={`Search ${cat.shortTitle.toLowerCase()}…`}
                  aria-label={`Search ${cat.title}`}
                  className="h-10 w-56 rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                  Search
                </button>
              </form>
            </div>
            <div className="mt-6">
              <ResourceList items={items} />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
