import type { ResourceFile, ResourceSubfolder } from "@/lib/hooks/use-resource-folder";

export type ResourcePage = {
  __typename: "ResourcePage";
  id: string;
  name: string;
  slug: string;
  description: string;
  resourceType: string;
  revisionDate?: string;
  order: number;
  fileCount: number;
  children: ResourceSubfolder[];
  resources: ResourceFile[];
};
