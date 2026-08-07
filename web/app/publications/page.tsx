import type { Metadata } from "next";
import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { cmsFetch } from "@/lib/cms";
import {
  GET_PUBLICATIONS_INDEX_META,
  PUBLICATIONS_INDEX_URL_PATH,
  type PublicationsIndexMetaQueryResult,
} from "@/components/pages/PublicationIndexPage/queries";
import PublicationsRegister from "./register";

// This route has no dynamic segment, so Next.js would otherwise try to
// statically prerender it at build time — requiring a live CMS connection
// during build. It's CMS-backed content that changes without a redeploy, so
// render it per-request instead.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Policies & publications",
  description:
    "Official policies, sector reports, and guidelines published by the Ministry of Education and Human Resources Development.",
};

const fallbackLead =
  "National policies, sector performance reports, and guidelines — every entry carries a registry reference, a summary page, and the full document to download.";

export default async function PublicationsIndexPage() {
  const data = await cmsFetch<PublicationsIndexMetaQueryResult>(
    GET_PUBLICATIONS_INDEX_META,
    { urlPath: PUBLICATIONS_INDEX_URL_PATH },
  );
  const page = data.page;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-publications"
        title={page?.title ?? "The Ministry's official record."}
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
