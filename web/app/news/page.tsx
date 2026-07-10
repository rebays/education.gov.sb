import type { Metadata } from "next";
import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
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
      </main>

      <SiteFooter />
    </div>
  );
}
