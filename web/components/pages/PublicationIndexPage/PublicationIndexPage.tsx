import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import PublicationsRegister from "./register";
import type { PublicationIndexPage as PublicationIndexPageProps } from "./types";

// Shown when the CMS has no live PublicationIndexPage yet (the register
// itself fetches publications separately, so it still renders).
const fallbackTitle = "The Ministry's official record.";
const fallbackLead =
  "National policies, sector performance reports, and guidelines — every entry carries a registry reference, a summary page, and the full document to download.";

export default function PublicationIndexPage({
  page,
}: {
  page?: PublicationIndexPageProps;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-publications"
        title={page?.title ?? fallbackTitle}
        lead={page?.lead || fallbackLead}
        crumbs={[{ label: "Publications" }]}
      />

      <main className="flex-1 bg-background">
        <PublicationsRegister />
      </main>

      <SiteFooter />
    </div>
  );
}
