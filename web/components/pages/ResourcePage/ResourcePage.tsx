import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { ResourceFolderPreview } from "@/components/resources/resource-folder-preview";
import type { ResourcePage as ResourcePageProps } from "./types";

interface ResourcePageComponentProps {
  page: ResourcePageProps;
  pathSegments: Array<{ label: string; href: string }>;
}

export default function ResourcePage({ page, pathSegments }: ResourcePageComponentProps) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id={`resource-folder-${page.id}`}
        title={page.name}
        lead={page.description || ""}
        crumbs={[
          { label: "Resources", href: "/" },
          ...pathSegments.slice(0, -1),
        ]}
      />

      <main className="flex-1 bg-background">
        <ResourceFolderPreview
          files={page.resources}
          folderDescription={page.description}
          folderName={page.name}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
