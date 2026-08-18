import "server-only";

import { cmsFetch } from "./cms";
import {
  NEWS_PAGES_QUERY,
  type NewsPagesQueryResult,
} from "@/components/pages/NewsIndexPage/queries";
import {
  PUBLICATIONS_QUERY,
  type PublicationsQueryResult,
} from "@/components/pages/Publication/queries";
import {
  formatBytes,
  formatDisplayDate,
  officeDisplay,
  publicationTypeDisplay,
} from "@/components/pages/Publication/adapters";

/**
 * CMS-backed site search: resources via the server-side
 * `resourcePages(search:)` filter, publications and news fetched and
 * term-matched here (both sets are small and already served in full to
 * their index pages). A `level` scope narrows to resources only —
 * publications and news are sector-wide and not level-tagged.
 */

export type CmsSearchResult = {
  kind: "resource" | "publication" | "news";
  title: string;
  href: string;
  /** Category chip, e.g. "Primary", "Publication", "News". */
  chip: string;
  /** Short qualifier for compact rows, e.g. "Video", "Policy". */
  detail: string;
  /** Full metadata line for the results page. */
  meta: string;
  summary: string;
  icon: "video" | "report" | "document" | "calendar";
};

const SEARCH_RESOURCE_PAGES = /* GraphQL */ `
  query SearchResourcePages($search: String!, $level: String) {
    resourcePages(search: $search, level: $level) {
      name
      urlPath
      description
      resourceTypeDisplay
      lastUpdated
      fileCount
      level {
        name
      }
      resources {
        isVideo
      }
    }
  }
`;

type SearchResourcePagesResult = {
  resourcePages: Array<{
    name: string;
    urlPath: string;
    description: string;
    resourceTypeDisplay: string;
    lastUpdated: string | null;
    fileCount: number;
    level: { name: string } | null;
    resources: Array<{ isVideo: boolean }>;
  }>;
};

const newsCategoryDisplay: Record<string, string> = {
  announcement: "Announcement",
  press_release: "Press release",
  event: "Event",
};

const NEWS_SEARCH_POOL = 25;

function termsOf(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function matches(terms: string[], ...fields: Array<string | null>): boolean {
  const haystack = fields.filter(Boolean).join(" ").toLowerCase();
  return terms.every((t) => haystack.includes(t));
}

const stripTags = (html: string) => html.replace(/<[^>]+>/g, " ").trim();

export type SearchOptions = {
  /** EducationLevel slug — implies resources only. */
  level?: string;
  /** Restrict to resource results (e.g. the homepage hero search). */
  resourcesOnly?: boolean;
};

export async function searchCms(
  query: string,
  { level, resourcesOnly = false }: SearchOptions = {},
): Promise<CmsSearchResult[]> {
  const terms = termsOf(query);
  if (terms.length === 0) return [];

  const scoped = resourcesOnly || Boolean(level);

  const [resourceData, publicationData, newsData] = await Promise.all([
    cmsFetch<SearchResourcePagesResult>(SEARCH_RESOURCE_PAGES, {
      search: query.trim(),
      level: level ?? null,
    }),
    scoped
      ? null
      : cmsFetch<PublicationsQueryResult>(PUBLICATIONS_QUERY, {}),
    scoped
      ? null
      : cmsFetch<NewsPagesQueryResult>(NEWS_PAGES_QUERY, {
          first: NEWS_SEARCH_POOL,
        }),
  ]);

  const results: CmsSearchResult[] = [];

  for (const folder of resourceData.resourcePages) {
    const isVideo = folder.resources.some((r) => r.isVideo);
    const metaParts = [
      folder.resourceTypeDisplay,
      folder.lastUpdated ? formatDisplayDate(folder.lastUpdated) : null,
      `${folder.fileCount} ${folder.fileCount === 1 ? "file" : "files"}`,
    ].filter(Boolean);
    results.push({
      kind: "resource",
      title: folder.name,
      href: folder.urlPath,
      chip: folder.level?.name ?? "Resource",
      detail: folder.resourceTypeDisplay,
      meta: metaParts.join(" · "),
      summary: stripTags(folder.description),
      icon: isVideo ? "video" : "document",
    });
  }

  for (const pub of publicationData?.publications ?? []) {
    const type = publicationTypeDisplay[pub.publicationType];
    const office = officeDisplay[pub.office] ?? pub.office;
    const date = formatDisplayDate(pub.date);
    if (!matches(terms, pub.title, pub.summary, type, office, date)) continue;
    results.push({
      kind: "publication",
      title: pub.title,
      href: `/publications/${pub.slug}`,
      chip: "Publication",
      detail: type,
      meta: `${type} · ${date} · ${pub.fileExtension} · ${formatBytes(pub.fileSize)}`,
      summary: pub.summary,
      icon: type === "Report" ? "report" : "document",
    });
  }

  for (const { node } of newsData?.newsPages.edges ?? []) {
    const category = newsCategoryDisplay[node.category] ?? node.category;
    if (!matches(terms, node.title, node.excerpt, category)) continue;
    results.push({
      kind: "news",
      title: node.title,
      href: node.url ?? `/news-live/${node.slug}`,
      chip: "News",
      detail: category,
      meta: `${category} · ${formatDisplayDate(node.date)}`,
      summary: node.excerpt,
      icon: "calendar",
    });
  }

  return results;
}
