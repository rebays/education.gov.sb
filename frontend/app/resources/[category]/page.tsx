import { notFound, redirect } from "next/navigation";
import { categoryHref, getCategory } from "../../lib/content";

/**
 * There is no per-category listing page. Old /resources/<category> URLs
 * land on the resource index, pre-filtered to the matching curriculum level.
 */
export default async function ResourceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  redirect(categoryHref(cat.slug));
}
