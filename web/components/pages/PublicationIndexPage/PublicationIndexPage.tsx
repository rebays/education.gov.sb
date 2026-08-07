import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import PublicationsRegister from "@/app/publications/register";
import type { PublicationIndexPage as PublicationIndexPageProps } from "./types";

export default function PublicationIndexPage(_: {
  page: PublicationIndexPageProps;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-publications"
        title={_.page.title}
        lead={_.page.lead}
        crumbs={[{ label: "Publications" }]}
      />

      <main className="flex-1 bg-background">
        <PublicationsRegister />
      </main>

      <SiteFooter />
    </div>
  );
}
