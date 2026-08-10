import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { CurriculumExplorer } from "@/components/resources/curriculum-explorer";
import type { ResourceIndexPage as ResourceIndexPageProps } from "./types";

export default function ResourceIndexPage(_: { page: ResourceIndexPageProps }) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-resources"
        title={_.page.title}
        lead={_.page.lead}
        crumbs={[{ label: "Resources" }]}
      />

      <main className="flex-1 bg-background">
        <CurriculumExplorer initialLevel="primary" initialFilters={{ subjectId: null, gradeId: null, type: null, query: "" }} />
      </main>

      <SiteFooter />
    </div>
  );
}
