import type { Metadata } from "next";
import { cmsFetch } from "@/lib/cms";
import { GET_PAGE, GET_PAGE_BY_TOKEN } from "@/lib/queries";
import { getResourceFolder } from "@/lib/hooks/use-resource-folder";
import { draftMode } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { renderCmsPage, type CmsPage } from "@/components/pages/registry";
import NewsIndexPage from "@/components/pages/NewsIndexPage/NewsIndexPage";
import AccessibilityPage from "@/components/pages/AccessibilityPage/AccessibilityPage";
import PublicationIndexPage from "@/components/pages/PublicationIndexPage/PublicationIndexPage";
import PublicationPage, {
  loadPublication,
} from "@/components/pages/Publication/PublicationPage";
import {
  PUBLICATION_QUERY,
  type PublicationQueryResult,
} from "@/components/pages/Publication/queries";
import ResourcePage from "@/components/pages/ResourcePage/ResourcePage";

// Publications are CMS snippets, not Wagtail pages, so GET_PAGE can't
// resolve them: /publications/<slug> is matched here by URL shape instead.
const PUBLICATIONS_SLUG = "publications";
const NEWS_SLUG = "news";
const ACCESSIBILITY_SLUG = "accessibility";

const publicationSlugFrom = (slug: string[]) =>
  slug.length === 2 && slug[0] === PUBLICATIONS_SLUG ? slug[1] : null;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (slug.length === 1 && slug[0] === PUBLICATIONS_SLUG) {
    return {
      title: "Policies & publications",
      description:
        "Official policies, sector reports, and guidelines published by the Ministry of Education and Human Resources Development.",
    };
  }

  if (slug.length === 1 && slug[0] === NEWS_SLUG) {
    return {
      title: "News",
      description:
        "Announcements, press releases, and events from the Ministry of Education and Human Resources Development.",
    };
  }

  if (slug.length === 1 && slug[0] === ACCESSIBILITY_SLUG) {
    return {
      title: "Accessibility",
      description:
        "The Ministry of Education and Human Resources Development's commitment to making education.gov.sb usable by everyone.",
    };
  }

  const pubSlug = publicationSlugFrom(slug);
  if (pubSlug) {
    const data = await cmsFetch<PublicationQueryResult>(PUBLICATION_QUERY, {
      slug: pubSlug,
    });
    const pub = data.publication;
    if (pub) return { title: pub.title, description: pub.summary };
  }

  return {};
}

async function catchAllPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ slug }, { token }, { isEnabled: isDraft }] = await Promise.all([
    params,
    searchParams,
    draftMode(),
  ]);

  const urlPath = `/${slug.join("/")}/`;

  const data =
    isDraft && token
      ? await cmsFetch<{ page: CmsPage | null }>(GET_PAGE_BY_TOKEN, { token })
      : await cmsFetch<{ page: CmsPage | null }>(GET_PAGE, { urlPath });

  if (data.page) {
    return renderCmsPage(data.page);
  }

  // Publication detail: backed by the publication snippet query, so it has
  // no page to find above — resolved here by its /publications/<slug> shape.
  const pubSlug = publicationSlugFrom(slug);
  if (pubSlug) {
    const { pub, allItems } = await loadPublication(pubSlug);
    if (pub) {
      return <PublicationPage pub={pub} allItems={allItems} />;
    }
  }

  // Publications index keeps working before a PublicationIndexPage exists in
  // the CMS: the register fetches its entries independently of the page.
  if (slug.length === 1 && slug[0] === PUBLICATIONS_SLUG) {
    return <PublicationIndexPage />;
  }

  // Same for the newsroom: the front page's stories come from the newsPages
  // query, so /news renders before a NewsIndexPage exists at this slug.
  if (slug.length === 1 && slug[0] === NEWS_SLUG) {
    return <NewsIndexPage />;
  }

  // Accessibility statement falls back to the launch text kept in
  // components/pages/AccessibilityPage/fallback.ts until an editor creates
  // the page in the CMS.
  if (slug.length === 1 && slug[0] === ACCESSIBILITY_SLUG) {
    return <AccessibilityPage />;
  }

  // Try resource folder for paths with 2+ segments
  if (slug.length > 1) {
    const folderPath = slug.slice(1).join("/");
    const folder = await getResourceFolder(folderPath);

    // The folder must sit under the resource index page named by the first
    // segment. A null resourceIndexPageSlug is allowed as a fallback during
    // setup, before folders have been associated with an index page.
    const isUnderThisIndex =
      folder &&
      (!folder.resourceIndexPageSlug || folder.resourceIndexPageSlug === slug[0]);

    if (isUnderThisIndex) {
      // A folder earns a page by holding something: files make it a
      // resource, subfolders make it a directory of them. One holding
      // neither has nothing to show, so rather than 404 on a truncated or
      // emptied URL, send the visitor to the section index.
      const hasSomethingToBrowse = folder.children.some(
        (child) => child.fileCount > 0 || child.childCount > 0,
      );
      if (folder.resources.length === 0 && !hasSomethingToBrowse) {
        redirect(`/${folder.resourceIndexPageSlug ?? slug[0]}/`);
      }

      return (
        <ResourcePage
          page={{
            __typename: "ResourcePage",
            id: folder.id,
            name: folder.name,
            slug: folder.slug,
            description: folder.description,
            displayLead: folder.displayLead,
            coverImage: folder.coverImage,
            resourceType: folder.resourceType,
            resourceTypeDisplay: folder.resourceTypeDisplay,
            publishedDate: folder.publishedDate,
            subject: folder.subject,
            yearLevels: folder.yearLevels,
            order: folder.order,
            fileCount: folder.fileCount,
            children: folder.children,
            resources: folder.resources,
          }}
          indexPath={`/${folder.resourceIndexPageSlug ?? slug[0]}/`}
          indexTitle={folder.resourceIndexPageTitle}
          ancestors={folder.ancestorFolders}
        />
      );
    }
  }

  notFound();
}

export default catchAllPage;
