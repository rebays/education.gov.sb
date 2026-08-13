import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { ResourceFolderPreview } from "@/components/resources/resource-folder-preview";
import { ScrollPastHero } from "@/components/resources/scroll-past-hero";
import { SubfolderList } from "@/components/resources/subfolder-list";
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
  // Ancestors arrive outermost-first, so each one's path is the index path
  // plus every slug down to and including it. Built from indexPath rather
  // than each folder's own urlPath, which falls back to a literal
  // "resources" prefix when a folder has no index page associated — that
  // would point the link at the wrong section.
  const pathTo = (depth: number) =>
    `${indexPath}${ancestors
      .slice(0, depth)
      .map((a) => a.slug)
      .join("/")}${depth > 0 ? "/" : ""}`;

  // Every ancestor is navigable: it holds at least the branch leading here,
  // so it renders either as a resource page or as a directory of folders.
  const ancestorCrumbs = ancestors.map((ancestor, index) => ({
    label: ancestor.name,
    href: pathTo(index + 1),
  }));

  const folderPath = `${pathTo(ancestors.length)}${page.slug}/`;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id={`resource-folder-${page.id}`}
        title={page.name}
        lead={page.displayLead}
        crumbs={[
          { label: indexTitle || "Resources", href: indexPath },
          // Most ancestors are CMS-side organisation and redirect back to
          // the index, so they stay as plain context; one that holds files
          // of its own is a real page and gets linked. Labelled by name,
          // since a folder's slug is often an internal working name.
          ...ancestorCrumbs,
          // The trail ends at the resource itself: ancestorFolders stops
          // short of this folder, so without this the deepest page and the
          // index share a breadcrumb.
          { label: page.name },
        ]}
      />

      {/* Only worth skipping the hero when there is a preview to land on.
          A directory page's content is a list of links, and the hero holds
          the breadcrumb saying where in the tree that list sits — scrolling
          past it would hide the most useful thing on the page. */}
      {page.resources.length > 0 && <ScrollPastHero targetId={CONTENT_ID} />}

      {/* scroll-mt clears the sticky site header, which the browser would
          otherwise leave covering the top of the content. */}
      {/* A folder may hold files, subfolders, or both — whatever the editor
          built — so each section stands on its own rather than assuming one
          shape. The route only turns a folder away when it has neither. */}
      <main id={CONTENT_ID} className="flex-1 scroll-mt-20 bg-background">
        {page.resources.length > 0 && (
          <ResourceFolderPreview
            files={page.resources}
            folderDescription={page.description}
            folderName={page.name}
            subject={page.subject?.name}
            yearLevelLabels={page.yearLevels.map((y) => y.label)}
            typeLabel={page.resourceTypeDisplay}
            publishedDate={page.publishedDate}
          />
        )}

        {page.children.length > 0 && (
          <div className="mx-auto w-full max-w-8xl px-6 py-14">
            <SubfolderList subfolders={page.children} basePath={folderPath} />
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
