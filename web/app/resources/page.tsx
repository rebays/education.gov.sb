import type { Metadata } from "next";
import PageHeader from "../components/page-header";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";
import {
  getGrades,
  getSubjects,
  resourceTypes,
  type Level,
  type ResourceType,
} from "../lib/curriculum";
import { CurriculumExplorer } from "./components/curriculum-explorer";
import type { CurriculumFilters } from "./components/curriculum-sidebar";

export const metadata: Metadata = {
  title: "Curriculum Index",
  description:
    "Browse curriculum materials by subject and grade level, or drill into the full coverage map across Primary and Secondary.",
};

/**
 * `?level=` accepts the explorer's two levels plus the legacy category slugs
 * (the old /resources/<category> pages), which collapse onto them.
 */
const levelParam: Record<string, Level> = {
  primary: "primary",
  secondary: "secondary",
  "early-childhood": "primary",
  "junior-secondary": "secondary",
  "senior-secondary": "secondary",
};

function first(value: string | string[] | undefined): string | null {
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

export default async function ResourceIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const level = levelParam[first(params.level) ?? ""] ?? "primary";
  const subjectId = first(params.subject);
  const gradeId = first(params.grade);
  const type = first(params.type);

  const initialFilters: CurriculumFilters = {
    subjectId: getSubjects(level).some((s) => s.id === subjectId)
      ? subjectId
      : null,
    gradeId: getGrades(level).some((g) => g.id === gradeId) ? gradeId : null,
    type: resourceTypes.includes(type as ResourceType)
      ? (type as ResourceType)
      : null,
    query: first(params.q) ?? "",
  };

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-resources"
        title="Digital Curriculum, one map to master your learning path."
        lead="See what's published against each subject and grade level at a glance, then drill into the resources behind any cell."
        crumbs={[{ label: "Resources" }]}
      />

      <main className="flex-1 bg-background">
        <CurriculumExplorer initialLevel={level} initialFilters={initialFilters} />
      </main>

      <SiteFooter />
    </div>
  );
}
