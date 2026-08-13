import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { ResourceFolderPreview } from "@/components/resources/resource-folder-preview";
import { ScrollPastHero } from "@/components/resources/scroll-past-hero";
import type { ResourceAncestor } from "@/lib/hooks/use-resource-folder";
import type { ResourcePage as ResourcePageProps } from "./types";

/** Scroll target for {@link ScrollPastHero}. */
const CONTENT_ID = "resource-content";

interface ResourcePageComponentProps {
  page: ResourcePageProps;
  /** Path of the ResourceIndexPage this resource belongs to. */
  indexPath: string;
  /** Its title, for the breadcrumb label. Falls back when unassociated. */
  indexTitle?: string | null;
  ancestors: ResourceAncestor[];
}

export default function ResourcePage({
  page,
  indexPath,
  indexTitle,
  ancestors,
}: ResourcePageComponentProps) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id={`resource-folder-${page.id}`}
        title={page.name}
        lead={page.displayLead}
        crumbs={[
          { label: indexTitle || "Resources", href: indexPath },
          // Ancestors are CMS-side organisation, not public pages — their
          // URLs just redirect back to the index, so they're shown as
          // context rather than links. Labelled by name, since a folder's
          // slug is often an internal working name.
          ...ancestors.map((ancestor) => ({ label: ancestor.name })),
          // The trail ends at the resource itself: ancestorFolders stops
          // short of this folder, so without this the deepest page and the
          // index share a breadcrumb.
          { label: page.name },
        ]}
      />

      <ScrollPastHero targetId={CONTENT_ID} />

      {/* scroll-mt clears the sticky site header, which the browser would
          otherwise leave covering the top of the content. */}
      <main id={CONTENT_ID} className="flex-1 scroll-mt-20 bg-background">
        <ResourceFolderPreview
          files={page.resources}
          folderDescription={page.description}
          folderName={page.name}
          subject={page.subject?.name}
          yearLevelLabels={page.yearLevels.map((y) => y.label)}
          typeLabel={page.resourceTypeDisplay}
          publishedDate={page.publishedDate}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
