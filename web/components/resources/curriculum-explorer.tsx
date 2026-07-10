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
} from "@/app/lib/curriculum";
import { CoverageMap } from "./coverage-map";
import { CurriculumResourceList } from "./curriculum-resource-list";
import { CurriculumSidebar, type CurriculumFilters } from "./curriculum-sidebar";
import { MobileFilterIsland } from "./mobile-filter-island";

type ViewMode = "map" | "list";

const emptyFilters: CurriculumFilters = { type: null, subjectId: null, gradeId: null, query: "" };

const levelTabs: { value: Level; label: string }[] = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
];

/**
 * Owns all filtering state for the Curriculum Index (level, view mode,
 * active filters, filter-pane visibility) and wires the sidebar, tab bar,
 * search box, coverage map, and resource list together. `resources/page.tsx`
 * renders this as the sole stateful piece of the page — it stays a server
 * component (so it can still export `metadata`) and delegates interactivity
 * here.
 *
 * The list (most recently updated resources, filterable) is the default
 * landing state; the Coverage Map is opt-in via the sidebar button and via
 * drilling into a specific subject/grade cell.
 *
 * `initialLevel`/`initialFilters` seed the state from URL params
 * (/resources?level=…&subject=…), already validated by the page.
 */
export function CurriculumExplorer({
  initialLevel = "primary",
  initialFilters = emptyFilters,
}: {
  initialLevel?: Level;
  initialFilters?: CurriculumFilters;
}) {
  const [level, setLevel] = useState<Level>(initialLevel);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<CurriculumFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(true);

  const subjects = useMemo(() => getSubjects(level), [level]);
  const grades = useMemo(() => getGrades(level), [level]);

  const filteredResources = useMemo(
    () => getCurriculumResources({ level, ...filters }),
    [level, filters]
  );

  const hasActiveFilters = Boolean(
    filters.type || filters.subjectId || filters.gradeId || filters.query
  );

  function handleLevelChange(next: Level) {
    setLevel(next);
    setFilters(emptyFilters);
    setViewMode("list");
  }

  function handleFilterChange(patch: Partial<CurriculumFilters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setViewMode("list");
  }

  function handleCellClick(subjectId: string, gradeId: string) {
    setFilters({ type: null, subjectId, gradeId, query: "" });
    setViewMode("list");
  }

  function handleShowMap() {
    setViewMode("map");
  }

  function handleBackToList() {
    setViewMode("list");
  }

  const activeSubject = subjects.find((s) => s.id === filters.subjectId);
  const activeGrade = grades.find((g) => g.id === filters.gradeId);

  return (
    <div className="mx-auto flex w-full max-w-8xl flex-col gap-8 px-6 py-12 lg:flex-row">
      <MobileFilterIsland
        resourceTypes={resourceTypes}
        subjects={subjects}
        grades={grades}
        filters={filters}
        onFilterChange={handleFilterChange}
        onShowMap={handleShowMap}
      />

      {showFilters && (
        <CurriculumSidebar
          resourceTypes={resourceTypes}
          subjects={subjects}
          grades={grades}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={() => setFilters(emptyFilters)}
          onShowMap={handleShowMap}
          onBackToList={handleBackToList}
          isMapOpen={viewMode === "map"}
        />
      )}

      <div className="min-w-0 flex-1">
        {/* level tabs (map only) + intro/count + filter pane toggle */}
        <div className="flex flex-wrap items-center gap-4 border-b border-border py-2">
          {viewMode === "map" && (
            <div role="tablist" aria-label="Curriculum level" className="flex gap-1">
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
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters((s) => !s)}
              aria-expanded={showFilters}
              aria-controls="curriculum-filters-panel"
              className="hidden lg:inline-flex"
            >
              <Icon name="filter" className="h-4 w-4" />
              {showFilters ? "Hide filters" : "Show filters"}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(emptyFilters)}
              >
                Clear filters
              </Button>
            )}
          </div>

          {viewMode === "map" ? (
            <div className="ml-auto flex flex-wrap items-center gap-3 lg:hidden">
              <Button variant="secondary" size="sm" onClick={handleBackToList}>
                <Icon name="arrow" className="h-4 w-4 rotate-180" />
                Back to resource list
              </Button>
              <p className="text-sm text-muted">
                Coverage across every subject and {level === "primary" ? "year" : "form"} level.
                Select a number to see the resources published for that subject and grade.
              </p>
            </div>
          ) : (
            <p
              key={`${level}-${filters.type ?? ""}-${filters.subjectId ?? ""}-${filters.gradeId ?? ""}-${filters.query}`}
              className="animate-in fade-in-0 slide-in-from-top-1 ml-auto text-sm text-muted duration-300"
              aria-live="polite"
            >
              {hasActiveFilters ? (
                <>
                  {filteredResources.length} {filteredResources.length === 1 ? "resource" : "resources"}
                  {activeSubject && <> · {activeSubject.name}</>}
                  {activeGrade && <> · {activeGrade.label}</>}
                  {filters.type && <> · {filters.type}</>}
                  {filters.query && <> · &ldquo;{filters.query}&rdquo;</>}
                </>
              ) : (
                <>Showing {filteredResources.length} recently updated resources</>
              )}
            </p>
          )}
        </div>

        <div className="mt-6 pb-24 lg:pb-0">
          {viewMode === "map" ? (
            <CoverageMap
              subjects={subjects}
              grades={grades}
              countFor={(subjectId, gradeId) =>
                getCurriculumResources({ level, subjectId, gradeId }).length
              }
              onCellClick={handleCellClick}
            />
          ) : (
            <CurriculumResourceList
              key={`${level}-${filters.type ?? ""}-${filters.subjectId ?? ""}-${filters.gradeId ?? ""}-${filters.query}`}
              resources={filteredResources}
              subjects={subjects}
              grades={grades}
            />
          )}
        </div>
      </div>
    </div>
  );
}
