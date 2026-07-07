import type { Metadata } from "next";
import Link from "next/link";
import HeroSearch from "./components/hero-search";
import PageHeader from "./components/page-header";
import SiteFooter from "./components/site-footer";
import SiteHeader from "./components/site-header";
import { categories, categoryHref } from "./lib/content";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "The page you're looking for may have been moved, renamed, or no longer exists.",
};

const quickLinks = [
  { label: "Resources", href: "/resources" },
  { label: "Publications", href: "/publications" },
  { label: "News", href: "/news" },
  { label: "About", href: "/about" },
];

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-404"
        title="We can't find that page."
        lead="The link may be outdated, or the page may have been moved. Try a search, or start again from one of the sections below."
        crumbs={[{ label: "Page not found" }]}
      >
        <HeroSearch className="mt-8 max-w-2xl" />

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md transition-colors hover:border-white/40 hover:bg-white/20 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="mt-8 font-mono text-xs text-white/50">Error 404</p>
      </PageHeader>

      <main className="flex-1 bg-background">
        <div className="mx-auto w-full max-w-8xl px-6 py-14">
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
      </main>

      <SiteFooter />
    </div>
  );
}
