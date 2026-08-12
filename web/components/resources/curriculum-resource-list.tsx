"use client";

import { useState } from "react";
import { ResourceCard, type ResourceCardProps } from "@/components/ui/resource-card";
import {
  formatUpdated,
  formatYearLevelRange,
  type CurriculumResource,
  type YearLevel,
} from "@/lib/curriculum";
import { cn } from "@/lib/utils";

const FALLBACK_COVER = "/cat-resources.jpg";

/** Dewey-flavoured base number per subject, used to build a catalog-style call number. */
const deweyBySubject: Record<string, number> = {
  english: 420,
  mathematics: 510,
  science: 500,
  "social-studies": 300,
  "health-pe": 613,
  "religious-education": 230,
  "arts-crafts": 700,
  "design-technology": 600,
  "business-studies": 650,
  agriculture: 630,
};

const typeCodes: Record<string, string> = {
  syllabus: "SYL",
  teacher_guide: "TCH",
  workbook: "WBK",
  assessment: "ASM",
  video: "VID",
  print_pack: "PRT",
  other: "GEN",
};

/**
 * `530.076 TCH Y4` — subject Dewey number, ".076" (curricula), resource type,
 * year level. Falls back gracefully when a resource isn't fully classified,
 * since every curriculum facet in the CMS is optional.
 */
function callNumberFor(resource: CurriculumResource): string {
  const base = resource.subjectSlug ? (deweyBySubject[resource.subjectSlug] ?? 0) : 0;
  const code = typeCodes[resource.type] ?? "GEN";
  const year = resource.yearLevelSlugs[0]?.toUpperCase() ?? "";
  return `${base}.076 ${code}${year ? ` ${year}` : ""}`;
}

function yearLabelFor(resource: CurriculumResource, yearLevels: YearLevel[]): string {
  const labels = resource.yearLevelSlugs
    .map((slug) => yearLevels.find((y) => y.slug === slug)?.label)
    .filter((label): label is string => Boolean(label));
  return formatYearLevelRange(labels);
}

function toCardProps(
  resource: CurriculumResource,
  yearLevels: YearLevel[],
): ResourceCardProps {
  const meta = [
    yearLabelFor(resource, yearLevels),
    resource.updated ? `Updated ${formatUpdated(resource.updated)}` : "",
    resource.format,
    resource.size,
  ]
    .filter(Boolean)
    .join(" · ");

  const badges = resource.typeLabel
    ? [
        {
          label: resource.typeLabel,
          tone: resource.type === "assessment" ? ("accent" as const) : ("primary" as const),
        },
      ]
    : [];

  if (resource.isVideo) {
    return {
      variant: "video",
      duration: "",
      title: resource.title,
      description: resource.summary,
      meta,
      badges,
      href: resource.href,
    };
  }

  return {
    variant: "textbook",
    // The folder's OG image doubles as the shelf cover; most resources
    // won't have one, so fall back to the generic library artwork.
    image: resource.coverImage ?? FALLBACK_COVER,
    callNumber: callNumberFor(resource),
    title: resource.title,
    description: resource.summary,
    meta,
    badges,
    href: resource.href,
  };
}

export function CurriculumResourceList({
  resources,
  yearLevels,
}: {
  resources: CurriculumResource[];
  yearLevels: YearLevel[];
}) {
  const documents = resources.filter((r) => !r.isVideo);
  const videos = resources.filter((r) => r.isVideo);

  const [tab, setTab] = useState<"documents" | "videos">(
    documents.length > 0 ? "documents" : "videos"
  );

  if (resources.length === 0) {
    return (
      <div className="animate-in fade-in-0 zoom-in-95 rounded-2xl border border-dashed border-border bg-surface p-12 text-center duration-300">
        <p className="text-[15px] text-muted">No resources match these filters yet.</p>
      </div>
    );
  }

  const showTabs = documents.length > 0 && videos.length > 0;
  const activeTab = showTabs ? tab : documents.length > 0 ? "documents" : "videos";

  const tabs: { value: "documents" | "videos"; label: string; count: number }[] = [
    { value: "documents", label: "Textbooks & documents", count: documents.length },
    { value: "videos", label: "Videos", count: videos.length },
  ];

  return (
    <div className="flex flex-col gap-6">
      {showTabs && (
        <div role="tablist" aria-label="Resource type" className="flex gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={activeTab === t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                activeTab === t.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              )}
            >
              {t.label}
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-normal text-muted">
                {t.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {activeTab === "documents" ? (
        <div
          key="documents"
          className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6"
        >
          {documents.map((r, i) => (
            <ResourceCard
              key={r.id}
              className="animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-300"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              {...toCardProps(r, yearLevels)}
            />
          ))}
        </div>
      ) : (
        <div key="videos" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((r, i) => (
            <ResourceCard
              key={r.id}
              className="animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-300"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              {...toCardProps(r, yearLevels)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
