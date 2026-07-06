import { ResourceCard, type ResourceCardProps } from "@/components/ui/resource-card";
import type { CurriculumResource, Grade, Subject } from "../../lib/curriculum";

function toCardProps(
  resource: CurriculumResource,
  subject: Subject | undefined,
  grade: Grade | undefined
): ResourceCardProps {
  const gradeLabel = grade?.label ?? resource.gradeId;
  const badges = [{ label: subject?.name ?? resource.subjectId, tone: "primary" as const }];
  const href = `/resources/curriculum/${resource.id}`;

  if (resource.type === "Video") {
    return {
      variant: "video",
      duration: resource.size,
      title: resource.title,
      description: resource.summary,
      meta: `${gradeLabel} · Updated ${resource.updated} · ${resource.format}`,
      badges: [...badges, { label: "Video", tone: "primary" }],
      href,
    };
  }

  const isAssessment = resource.type === "Assessment";
  return {
    variant: isAssessment ? "report" : "document",
    icon: isAssessment ? "report" : resource.type === "Syllabus" ? "book" : "document",
    title: resource.title,
    description: resource.summary,
    meta: `${gradeLabel} · Updated ${resource.updated} · ${resource.format} · ${resource.size}`,
    badges: [...badges, { label: resource.type, tone: isAssessment ? "accent" : "primary" }],
    href,
    actions: [
      { label: "Preview", variant: "primary", href },
      { label: "Download", icon: "download", variant: "ghost" },
    ],
  };
}

export function CurriculumResourceList({
  resources,
  subjects,
  grades,
}: {
  resources: CurriculumResource[];
  subjects: Subject[];
  grades: Grade[];
}) {
  if (resources.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
        <p className="text-[15px] text-muted">No resources match these filters yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {resources.map((r) => (
        <ResourceCard
          key={r.id}
          {...toCardProps(
            r,
            subjects.find((s) => s.id === r.subjectId),
            grades.find((g) => g.id === r.gradeId)
          )}
        />
      ))}
    </div>
  );
}
