import "server-only";

import {
  formatFileSize,
  type CurriculumResource,
  type CurriculumVocabulary,
} from "./curriculum";

/**
 * Server-side fetch for the Curriculum Index.
 *
 * One round trip pulls the whole published set plus the vocabulary that
 * drives the filter controls. The explorer then filters in the browser: the
 * library is small enough that shipping it once beats a request per
 * keystroke, and the coverage map needs counts for every subject/year cell
 * anyway — including the empty ones, which is the point of the map.
 *
 * If the library outgrows this, `resourcePages` already accepts
 * level/subject/yearLevel/type/search arguments server-side.
 */
const GET_CURRICULUM = /* GraphQL */ `
  query GetCurriculum {
    educationLevels {
      slug
      name
    }
    yearLevels {
      slug
      label
      levelSlug
    }
    subjects {
      slug
      name
      levels {
        slug
      }
    }
    resourceTypes {
      value
      label
    }
    resourcePages {
      id
      name
      slug
      description
      urlPath
      resourceType
      resourceTypeDisplay
      lastUpdated
      coverImage {
        url
      }
      fileCount
      level {
        slug
      }
      subject {
        slug
      }
      yearLevels {
        slug
      }
      topics {
        name
      }
      resources {
        fileExtension
        fileSize
        isVideo
      }
    }
  }
`;

type RawResourcePage = {
  id: string;
  name: string;
  slug: string;
  description: string;
  urlPath: string;
  resourceType: string;
  resourceTypeDisplay: string;
  lastUpdated: string;
  fileCount: number;
  coverImage: { url: string } | null;
  level: { slug: string } | null;
  subject: { slug: string } | null;
  yearLevels: { slug: string }[];
  topics: { name: string }[];
  resources: { fileExtension: string; fileSize?: number; isVideo: boolean }[];
};

type RawCurriculum = {
  educationLevels: { slug: string; name: string }[];
  yearLevels: { slug: string; label: string; levelSlug: string }[];
  subjects: { slug: string; name: string; levels: { slug: string }[] }[];
  resourceTypes: { value: string; label: string }[];
  resourcePages: RawResourcePage[];
};

export type CurriculumData = {
  vocabulary: CurriculumVocabulary;
  resources: CurriculumResource[];
};

const EMPTY: CurriculumData = {
  vocabulary: { levels: [], subjects: [], yearLevels: [], resourceTypes: [] },
  resources: [],
};

async function cmsServerFetch<T>(query: string): Promise<T> {
  const cmsUrl = process.env.CMS_GRAPHQL_URL;
  if (!cmsUrl) {
    throw new Error("CMS_GRAPHQL_URL not configured");
  }

  const res = await fetch(cmsUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(json.errors?.[0]?.message ?? `CMS ${res.status}`);
  }
  return json.data as T;
}

function toResource(page: RawResourcePage): CurriculumResource {
  // The folder is the resource; its files are the downloads. The listing
  // shows one line of file meta, taken from the first file.
  const firstFile = page.resources[0];
  return {
    id: page.id,
    title: page.name,
    summary: page.description ?? "",
    href: page.urlPath,
    type: page.resourceType ?? "",
    typeLabel: page.resourceTypeDisplay ?? "",
    levelSlug: page.level?.slug ?? null,
    subjectSlug: page.subject?.slug ?? null,
    yearLevelSlugs: page.yearLevels.map((y) => y.slug),
    topics: page.topics.map((t) => t.name),
    updated: page.lastUpdated ?? "",
    coverImage: page.coverImage?.url ?? null,
    format: firstFile?.fileExtension?.toUpperCase() ?? "",
    size: formatFileSize(firstFile?.fileSize),
    isVideo: firstFile?.isVideo ?? false,
    fileCount: page.fileCount,
  };
}

const GET_SUBJECTS = /* GraphQL */ `
  query GetSubjects {
    subjects {
      slug
      name
    }
  }
`;

/**
 * Just the subject list — for callers like the homepage hero pills that
 * need the vocabulary without the whole published library.
 */
export async function getCurriculumSubjects(): Promise<
  { slug: string; name: string }[]
> {
  try {
    const data = await cmsServerFetch<{ subjects: { slug: string; name: string }[] }>(
      GET_SUBJECTS,
    );
    return data?.subjects ?? [];
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    return [];
  }
}

export async function getCurriculumData(): Promise<CurriculumData> {
  try {
    const data = await cmsServerFetch<RawCurriculum>(GET_CURRICULUM);
    if (!data) return EMPTY;

    return {
      vocabulary: {
        levels: data.educationLevels,
        yearLevels: data.yearLevels,
        subjects: data.subjects.map((s) => ({
          slug: s.slug,
          name: s.name,
          levelSlugs: s.levels.map((l) => l.slug),
        })),
        resourceTypes: data.resourceTypes,
      },
      resources: data.resourcePages.map(toResource),
    };
  } catch (error) {
    // A CMS outage shouldn't take the whole page down — the explorer
    // renders its empty state instead.
    console.error("Failed to fetch curriculum data:", error);
    return EMPTY;
  }
}
