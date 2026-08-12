/**
 * Client-safe types and filtering for the Curriculum Index.
 *
 * Keep this file free of server-only imports so it can be pulled into the
 * client components that make up the explorer. The CMS fetch lives in
 * ./curriculum-data, mirroring the nav.ts / menu.ts split.
 *
 * Everything here keys off CMS slugs (`primary`, `y1`, `mathematics`) rather
 * than display labels, so renaming a subject in the CMS doesn't silently
 * break a filter.
 */

export type EducationLevel = {
  slug: string;
  name: string;
};

export type YearLevel = {
  slug: string;
  label: string;
  levelSlug: string;
};

export type Subject = {
  slug: string;
  name: string;
  levelSlugs: string[];
};

export type ResourceTypeChoice = {
  value: string;
  label: string;
};

export type CurriculumResource = {
  id: string;
  title: string;
  summary: string;
  /** Public path of the resource page, e.g. `/resources/primary/year-1/`. */
  href: string;
  type: string;
  typeLabel: string;
  levelSlug: string | null;
  subjectSlug: string | null;
  yearLevelSlugs: string[];
  topics: string[];
  /** ISO date; formatted for display at render time. */
  updated: string;
  /** The folder's OG image, doubling as the card cover. Null when unset. */
  coverImage: string | null;
  /** Derived from the folder's first file — the explorer shows one line of file meta. */
  format: string;
  size: string;
  isVideo: boolean;
  fileCount: number;
};

export type CurriculumVocabulary = {
  levels: EducationLevel[];
  subjects: Subject[];
  yearLevels: YearLevel[];
  resourceTypes: ResourceTypeChoice[];
};

export type CurriculumFilters = {
  type: string | null;
  subjectSlug: string | null;
  yearLevelSlug: string | null;
  query: string;
};

export const emptyFilters: CurriculumFilters = {
  type: null,
  subjectSlug: null,
  yearLevelSlug: null,
  query: "",
};

/**
 * A null `levelSlug` means "all levels" — the explorer's default. Without it
 * there's no way to reach material an editor left unclassified, since every
 * curriculum facet in the CMS is optional.
 */
export function getSubjects(
  vocabulary: CurriculumVocabulary,
  levelSlug: string | null,
): Subject[] {
  if (!levelSlug) return vocabulary.subjects;
  return vocabulary.subjects.filter((s) => s.levelSlugs.includes(levelSlug));
}

export function getYearLevels(
  vocabulary: CurriculumVocabulary,
  levelSlug: string | null,
): YearLevel[] {
  if (!levelSlug) return vocabulary.yearLevels;
  return vocabulary.yearLevels.filter((y) => y.levelSlug === levelSlug);
}

export function filterResources(
  resources: CurriculumResource[],
  levelSlug: string | null,
  filters: Partial<CurriculumFilters>,
): CurriculumResource[] {
  const query = filters.query?.trim().toLowerCase();
  return resources
    .filter((r) => {
      if (levelSlug && r.levelSlug !== levelSlug) return false;
      if (filters.type && r.type !== filters.type) return false;
      if (filters.subjectSlug && r.subjectSlug !== filters.subjectSlug) return false;
      // A resource spanning Y1–Y3 matches any of those years
      if (
        filters.yearLevelSlug &&
        !r.yearLevelSlugs.includes(filters.yearLevelSlug)
      ) {
        return false;
      }
      if (query) {
        const haystack = [r.title, r.summary, ...r.topics].join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    })
    .sort((a, b) => b.updated.localeCompare(a.updated));
}

export function countCoverage(
  resources: CurriculumResource[],
  levelSlug: string,
  subjectSlug: string,
  yearLevelSlug: string,
): number {
  return resources.filter(
    (r) =>
      r.levelSlug === levelSlug &&
      r.subjectSlug === subjectSlug &&
      r.yearLevelSlugs.includes(yearLevelSlug),
  ).length;
}

/**
 * First level that actually has published material, for choosing a sensible
 * starting tab on the coverage map — which, unlike the list, can only show
 * one level at a time.
 */
export function firstPopulatedLevel(
  vocabulary: CurriculumVocabulary,
  resources: CurriculumResource[],
): string | null {
  const populated = vocabulary.levels.find((level) =>
    resources.some((r) => r.levelSlug === level.slug),
  );
  return populated?.slug ?? vocabulary.levels[0]?.slug ?? null;
}

/**
 * "Year 1, Year 2" for a pair, "Year 1 – Year 3" for a longer run. Shared by
 * the explorer cards and the resource page details table so a resource
 * spanning several years reads the same in both.
 */
export function formatYearLevelRange(labels: string[]): string {
  if (labels.length === 0) return "";
  if (labels.length > 2) return `${labels[0]} – ${labels[labels.length - 1]}`;
  return labels.join(", ");
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatUpdated(isoDate: string): string {
  if (!isoDate) return "";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
