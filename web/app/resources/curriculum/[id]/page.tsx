import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import {
  curriculumResources,
  getCurriculumResourceById,
  getCurriculumResources,
  getGrades,
  getSubjects,
} from "../../../lib/curriculum";
import { FactSheet } from "@/components/ui/fact-sheet";
import { CurriculumResourceList } from "@/components/resources/curriculum-resource-list";
import { DownloadActions } from "@/components/resources/download-actions";
import { ResourcePreviewer } from "@/components/resources/resource-previewer";

export function generateStaticParams() {
  return curriculumResources.map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resource = getCurriculumResourceById(id);
  if (!resource) return {};
  return { title: resource.title, description: resource.summary };
}

export default async function CurriculumResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = getCurriculumResourceById(id);
  if (!resource) notFound();

  const subject = getSubjects(resource.level).find((s) => s.id === resource.subjectId);
  const grade = getGrades(resource.level).find((g) => g.id === resource.gradeId);

  const related = getCurriculumResources({
    level: resource.level,
    subjectId: resource.subjectId,
  }).filter((r) => r.id !== resource.id);
  const relatedSubjects = getSubjects(resource.level);
  const relatedGrades = getGrades(resource.level);

  const facts: [string, string][] = [
    ["Subject", subject?.name ?? resource.subjectId],
    ["Grade / year level", grade?.label ?? resource.gradeId],
    ["Type", resource.type],
    ["Format", resource.format],
    ["File size", resource.size],
    ["Updated", resource.updated],
  ];

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id={`wm-curriculum-${resource.id}`}
        title={resource.title}
        lead={resource.summary}
        crumbs={[
          { label: "Resources", href: "/resources" },
          { label: subject?.name ?? "Subject" },
        ]}
      />

      <main className="flex-1 bg-background">
        <div className="mx-auto grid w-full max-w-8xl gap-10 px-6 py-14 lg:grid-cols-[1fr_320px]">
          {/* preview */}
          <div className="min-w-0">
            <ResourcePreviewer key={resource.id} resource={resource} />
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70">
                Description
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{resource.summary}</p>
            </div>
          </div>

          {/* metadata sidebar */}
          <aside className="flex flex-col gap-6 lg:pt-1">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70">
                Details
              </h2>
              <FactSheet className="mt-4" facts={facts} />
            </div>

            <DownloadActions resource={resource} />
          </aside>
        </div>

        {/* related */}
        {related.length > 0 && (
          <section className="bg-surface">
            <div className="mx-auto w-full max-w-8xl px-6 py-14">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                More {subject?.name ?? "subject"} resources
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-foreground">
                Related resources.
              </h2>
              <div className="mt-8">
                <CurriculumResourceList
                  resources={related.slice(0, 3)}
                  subjects={relatedSubjects}
                  grades={relatedGrades}
                />
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
