import type { ResourceFile, ResourceSubfolder } from "@/lib/hooks/use-resource-folder";

export type ResourcePage = {
  __typename: "ResourcePage";
  id: string;
  name: string;
  slug: string;
  description: string;
  displayLead: string;
  coverImage?: { url: string } | null;
  resourceType: string;
  resourceTypeDisplay: string;
  publishedDate?: string | null;
  subject?: { name: string } | null;
  yearLevels: { label: string }[];
  order: number;
  fileCount: number;
  children: ResourceSubfolder[];
  resources: ResourceFile[];
};
