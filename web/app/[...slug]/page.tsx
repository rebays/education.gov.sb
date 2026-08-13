import { cmsFetch } from "@/lib/cms";
import { GET_PAGE, GET_PAGE_BY_TOKEN } from "@/lib/queries";
import { getResourceFolder } from "@/lib/hooks/use-resource-folder";
import { draftMode } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { renderCmsPage, type CmsPage } from "@/components/pages/registry";
import ResourcePage from "@/components/pages/ResourcePage/ResourcePage";

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
      // Only folders that directly contain files are public pages. The rest
      // of the tree is CMS-side organisation, so rather than 404 on a
      // truncated URL, send the visitor to the section index.
      if (folder.resources.length === 0) {
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
