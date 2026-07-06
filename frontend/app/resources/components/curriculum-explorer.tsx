"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  getCurriculumResources,
  getGrades,
  getSubjects,
  resourceTypes,
  type Level,
} from "../../lib/curriculum";
import { CoverageMap } from "./coverage-map";
import { CurriculumResourceList } from "./curriculum-resource-list";
import { CurriculumSidebar, type CurriculumFilters } from "./curriculum-sidebar";

type ViewMode = "map" | "list";

const emptyFilters: CurriculumFilters = { type: null, subjectId: null, gradeId: null };

const levelTabs: { value: Level; label: string }[] = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
];

/**
 * Owns all filtering state for the Curriculum Index (level, view mode,
 * active filters) and wires the sidebar, tab bar, coverage map, and
 * resource list together. `resources/page.tsx` renders this as the sole
 * stateful piece of the page — it stays a server component (so it can
 * still export `metadata`) and delegates interactivity here.
 */
export function CurriculumExplorer() {
  const [level, setLevel] = useState<Level>("primary");
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [filters, setFilters] = useState<CurriculumFilters>(emptyFilters);

  const subjects = useMemo(() => getSubjects(level), [level]);
  const grades = useMemo(() => getGrades(level), [level]);

  const filteredResources = useMemo(
    () => getCurriculumResources({ level, ...filters }),
    [level, filters]
  );

  function handleLevelChange(next: Level) {
    setLevel(next);
    setFilters(emptyFilters);
    setViewMode("map");
  }

  function handleFilterChange(patch: Partial<CurriculumFilters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setViewMode("list");
  }

  function handleCellClick(subjectId: string, gradeId: string) {
    setFilters({ type: null, subjectId, gradeId });
    setViewMode("list");
  }

  function handleBackToMap() {
    setFilters(emptyFilters);
    setViewMode("map");
  }

  const activeSubject = subjects.find((s) => s.id === filters.subjectId);
  const activeGrade = grades.find((g) => g.id === filters.gradeId);

  return (
    <div className="mx-auto flex w-full max-w-8xl flex-col gap-8 px-6 py-12 lg:flex-row">
      <CurriculumSidebar
        resourceTypes={resourceTypes}
        subjects={subjects}
        grades={grades}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={() => setFilters(emptyFilters)}
      />

      <div className="min-w-0 flex-1">
        {/* level tabs */}
        <div role="tablist" aria-label="Curriculum level" className="flex gap-1 border-b border-border">
          {levelTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={level === tab.value}
              onClick={() => handleLevelChange(tab.value)}
              className={cn(
                "-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                level === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {viewMode === "map" ? (
            <>
              <p className="mb-4 text-[15px] text-muted">
                Coverage across every subject and {level === "primary" ? "year" : "form"} level.
                Select a number to see the resources published for that subject and grade.
              </p>
              <CoverageMap
                subjects={subjects}
                grades={grades}
                countFor={(subjectId, gradeId) =>
                  getCurriculumResources({ level, subjectId, gradeId }).length
                }
                onCellClick={handleCellClick}
              />
            </>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <Button variant="secondary" size="sm" onClick={handleBackToMap}>
                  <Icon name="arrow" className="h-4 w-4 rotate-180" />
                  Back to Coverage Map
                </Button>
                <p className="text-sm text-muted" aria-live="polite">
                  {filteredResources.length} {filteredResources.length === 1 ? "resource" : "resources"}
                  {activeSubject && <> · {activeSubject.name}</>}
                  {activeGrade && <> · {activeGrade.label}</>}
                  {filters.type && <> · {filters.type}</>}
                </p>
              </div>
              <CurriculumResourceList resources={filteredResources} subjects={subjects} grades={grades} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
