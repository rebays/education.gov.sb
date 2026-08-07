import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/page-header";
import SiteHeader from "@/components/shared/site-header";
import SiteFooter from "@/components/shared/site-footer";
import { ResourceFolderPreview } from "@/components/resources/resource-folder-preview";
import { getResourceFolder } from "@/lib/hooks/use-resource-folder";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = slug.join("/");
  const folder = await getResourceFolder(path);

  if (!folder) {
    return { title: "Not Found" };
  }

  return {
    title: folder.name,
    description: folder.description || `Browse resources in ${folder.name}`,
  };
}

export default async function FolderPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug: slugParams } = await params;
  const path = slugParams.join("/");
  const folder = await getResourceFolder(path);

  if (!folder || !folder.resources.length) {
    notFound();
  }

  const pathSegments = slugParams.map((slug, i) => ({
    label: slug,
    href: `/resources/${slugParams.slice(0, i + 1).join("/")}`,
  }));

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id={`resource-folder-${folder.id}`}
        title={folder.name}
        lead={folder.description || ""}
        crumbs={[
          { label: "Resources", href: "/resources" },
          ...pathSegments.slice(0, -1),
        ]}
      />

      <main className="flex-1 bg-background">
        <ResourceFolderPreview
          files={folder.resources}
          folderDescription={folder.description}
          folderName={folder.name}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
