import type { NewsCategory, NewsPost } from "@/app/lib/content";
import type { NewsPagesQueryResult } from "./queries";

/** Maps CMS news nodes onto the shared `NewsPost` shape so they render
 * through the existing story components (cards, briefs, banner). */

export type NewsNode =
  NewsPagesQueryResult["newsPages"]["edges"][number]["node"];

export const categoryFromCms: Record<NewsNode["category"], NewsCategory> = {
  announcement: "Announcement",
  press_release: "Press release",
  event: "Event",
};

export function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function toNewsPost(node: NewsNode): NewsPost {
  return {
    slug: node.slug,
    title: node.title,
    category: categoryFromCms[node.category],
    date: formatDisplayDate(node.date),
    excerpt: node.excerpt,
    image: node.image?.url,
    body: [],
    href: node.url ?? `/news-live/${node.slug}`,
  };
}
