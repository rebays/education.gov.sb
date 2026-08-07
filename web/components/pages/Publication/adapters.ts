import type { Publication, PublicationType } from "@/app/lib/content";
import type { PublicationListItem, PublicationTypeValue } from "./queries";

export const publicationTypeDisplay: Record<PublicationTypeValue, PublicationType> = {
  policy: "Policy",
  report: "Report",
  guideline: "Guideline",
};

// Mirrors publication.models.Publication.Office choices on the CMS.
export const officeDisplay: Record<string, string> = {
  planning: "Planning, Coordination & Research Division",
  strategic: "Strategic Support Unit",
  curriculum: "Curriculum Development Division",
  asset: "Asset Management Division",
};

export function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

/** Maps a CMS list item onto the shared `Publication` shape so it can be
 * rendered by the existing PublicationCover/PublicationRow components. */
export function toPublicationSummary(item: PublicationListItem): Publication {
  return {
    slug: item.slug,
    title: item.title,
    type: publicationTypeDisplay[item.publicationType],
    date: formatDisplayDate(item.date),
    format: item.fileExtension,
    size: formatBytes(item.fileSize),
    office: officeDisplay[item.office] ?? item.office,
    summary: item.summary,
    body: [],
  };
}

function publicationYearFrom(item: PublicationListItem): number {
  return new Date(item.date).getUTCFullYear();
}

/**
 * Official registry reference, e.g. MEHRD/2026/03 — numbered by publication
 * order within the year, computed over the full fetched list.
 */
export function publicationRefFor(
  item: PublicationListItem,
  all: PublicationListItem[],
): string {
  const year = publicationYearFrom(item);
  const ofYear = all
    .filter((p) => publicationYearFrom(p) === year)
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const n = ofYear.findIndex((p) => p.slug === item.slug) + 1;
  return `MEHRD/${year}/${String(n).padStart(2, "0")}`;
}
