import { cmsFetch } from "@/lib/cms";
import { GET_PAGE, GET_PAGE_BY_TOKEN } from "@/lib/queries";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { pageRegistry, type CmsPage } from "@/components/pages/registry";

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

  const data =
    isDraft && token
      ? await cmsFetch<{ page: CmsPage | null }>(GET_PAGE_BY_TOKEN, { token })
      : await cmsFetch<{ page: CmsPage | null }>(GET_PAGE, {
          urlPath: `/${slug.join("/")}/`,
        });

  if (!data.page) notFound();

  const Component = pageRegistry[data.page.__typename];
  if (!Component) notFound();

  return <Component page={data.page} />;
}

export default catchAllPage;
