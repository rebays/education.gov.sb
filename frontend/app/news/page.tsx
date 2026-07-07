import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "../components/page-header";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NewsFrontPage from "./front-page";

export const metadata: Metadata = {
  title: "News",
  description:
    "Announcements, press releases, and events from the Ministry of Education and Human Resources Development.",
};

export default function NewsIndexPage() {
  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-news"
        eyebrow="Newsroom"
        title="News from the Ministry."
        lead="Announcements, press releases, and events from across the education sector."
        crumbs={[{ label: "News" }]}
      >
        <p className="mt-5 flex flex-wrap items-center gap-x-3 text-sm text-white/70">
          <span className="font-mono">{dateline}</span>
          <span aria-hidden>·</span>
          <span>Honiara, Solomon Islands</span>
        </p>
      </PageHeader>

      <main className="flex-1 bg-background">
        <div className="mx-auto w-full max-w-8xl px-6 py-16">
          <NewsFrontPage />
        </div>

        {/* media enquiries */}
        <section className="bg-surface">
          <div className="mx-auto flex w-full max-w-8xl flex-wrap items-center justify-between gap-6 px-6 py-12">
            <div>
              <h2 className="font-serif text-2xl text-foreground">
                Media enquiries
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Journalists can reach the Media &amp; Communications Unit for
                interviews, statements, and background on any story.
              </p>
            </div>
            <Link
              href="/about/contact"
              className={cn(buttonVariants({ variant: "primary" }), "text-sm")}
            >
              Contact the unit
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
