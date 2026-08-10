import { cmsFetch } from "@/lib/cms";
import { GET_PAGE, GET_PAGE_BY_TOKEN } from "@/lib/queries";
import { getResourceFolder } from "@/lib/hooks/use-resource-folder";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
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

    // Validate: folder must have files and match the resource index page slug
    // (if resourceIndexPageSlug is null, allow it as a fallback during setup)
    const isValidResourcePath =
      folder &&
      folder.resources.length > 0 &&
      (!folder.resourceIndexPageSlug || folder.resourceIndexPageSlug === slug[0]);

    if (isValidResourcePath) {
      const pathSegments = slug.slice(1).map((s, i) => ({
        label: s,
        href: `/${slug.slice(0, i + 2).join("/")}`,
      }));

      return (
        <ResourcePage
          page={{
            __typename: "ResourcePage",
            id: folder.id,
            name: folder.name,
            slug: folder.slug,
            description: folder.description,
            resourceType: folder.resourceType,
            revisionDate: folder.revisionDate,
            order: folder.order,
            fileCount: folder.fileCount,
            children: folder.children,
            resources: folder.resources,
          }}
          pathSegments={pathSegments}
        />
      );
    }
  }

  notFound();
}

export default catchAllPage;
