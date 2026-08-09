const GET_RESOURCE_FOLDER = `
  query GetResourceFolder($path: String!) {
    resourceFolder(path: $path) {
      id
      name
      slug
      description
      resourceType
      revisionDate
      order
      fileCount
      resourceIndexPageSlug
      children {
        id
        name
        slug
        description
        order
        fileCount
      }
      resources {
        id
        label
        displayLabel
        url
        filename
        fileExtension
        isVideo
        fileSize
        language
        office
        publishedDate
        pages
      }
    }
  }
`;

export interface ResourceFile {
  id: string;
  label: string;
  displayLabel: string;
  url: string;
  filename: string;
  fileExtension: string;
  isVideo: boolean;
  fileSize?: number;
  language: string;
  office?: string;
  publishedDate?: string;
  pages?: number;
}

export interface ResourceSubfolder {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  fileCount: number;
}

export interface ResourceFolderData {
  id: string;
  name: string;
  slug: string;
  description: string;
  resourceType: string;
  revisionDate?: string;
  order: number;
  fileCount: number;
  resourceIndexPageSlug?: string;
  children: ResourceSubfolder[];
  resources: ResourceFile[];
}

async function cmsServerFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const cmsUrl = process.env.CMS_GRAPHQL_URL;
  if (!cmsUrl) {
    throw new Error("CMS_GRAPHQL_URL not configured");
  }

  const res = await fetch(cmsUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(json.errors?.[0]?.message ?? `CMS ${res.status}`);
  }
  return json.data as T;
}

export async function getResourceFolder(
  path: string,
): Promise<ResourceFolderData | null> {
  try {
    const data = await cmsServerFetch<{ resourceFolder: ResourceFolderData }>(
      GET_RESOURCE_FOLDER,
      { path },
    );

    if (!data?.resourceFolder) {
      return null;
    }

    return data.resourceFolder;
  } catch (error) {
    console.error("Failed to fetch resource folder:", error);
    return null;
  }
}
