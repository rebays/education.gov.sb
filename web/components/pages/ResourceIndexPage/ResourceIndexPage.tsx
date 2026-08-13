import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { CurriculumExplorer } from "@/components/resources/curriculum-explorer";
import { getCurriculumData } from "@/lib/curriculum-data";
import type { ResourceIndexPage as ResourceIndexPageProps } from "./types";

/**
 * Server component: fetches the published curriculum library and the
 * vocabulary behind the filters, then hands both to the client-side
 * explorer. Nothing here is hardcoded — levels, subjects, year levels and
 * resource types all come from the CMS.
 */
export default async function ResourceIndexPage({
  page,
}: {
  page: ResourceIndexPageProps;
}) {
  const { vocabulary, resources } = await getCurriculumData();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-resources"
        title={page.title}
        lead={page.lead}
        crumbs={[{ label: page.title }]}
      />

      <main className="flex-1 bg-background">
        <CurriculumExplorer vocabulary={vocabulary} resources={resources} />
      </main>

      <SiteFooter />
    </div>
  );
}
