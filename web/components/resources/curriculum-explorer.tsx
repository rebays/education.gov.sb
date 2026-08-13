"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  countCoverage,
  emptyFilters,
  filterResources,
  filtersFromSearchParams,
  firstPopulatedLevel,
  getSubjects,
  getYearLevels,
  type CurriculumFilters,
  type CurriculumResource,
  type CurriculumVocabulary,
} from "@/lib/curriculum";
import { CoverageMap } from "./coverage-map";
import { CurriculumResourceList } from "./curriculum-resource-list";
import { CurriculumSidebar } from "./curriculum-sidebar";
import { MobileFilterIsland } from "./mobile-filter-island";

type ViewMode = "map" | "list";

/**
 * Owns all filtering state for the Curriculum Index (view mode, map level,
 * active filters, filter-pane visibility) and wires the sidebar, tab bar,
 * search box, coverage map, and resource list together.
 *
 * All data arrives as props from `ResourceIndexPage`, which fetches it from
 * the CMS. Filtering runs in the browser over the full published set — see
 * `lib/curriculum-data.ts` for why.
 *
 * The default landing state shows filter instructions rather than an
 * unfiltered list — resources only render once at least one filter
 * (search, level, type, subject, or year level) is applied, whether by the
 * visitor or by the query string they arrived on. The Coverage Map is
 * opt-in via the sidebar button and via drilling into a specific
 * subject/year cell.
 */
const filterInstructionSteps: { icon: IconName; title: string; description: string }[] = [
  { icon: "search", title: "Search", description: "Type a keyword to search resource titles." },
  { icon: "tag", title: "Resource type", description: "Narrow to documents, videos, assessments, or syllabi." },
  { icon: "book", title: "Subject", description: "Pick a subject to see everything published for it." },
  { icon: "graduation", title: "Grade / year level", description: "Filter to a specific year or form level." },
];

function FilterInstructions({ onShowAll }: { onShowAll: () => void }) {
  return (
    <div className="animate-in fade-in-0 zoom-in-95 flex min-h-128 flex-col justify-center rounded-2xl border border-dashed border-border bg-surface p-16 text-center duration-300">
      <Icon name="filter" className="mx-auto h-10 w-10 text-muted" />
      <h2 className="mt-6 font-serif text-2xl text-foreground">Find the resources you need</h2>
      <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">
        Use the filters to search by keyword, or narrow by resource type, subject, and grade level.
        Matching resources will appear here as soon as you apply a filter.
      </p>
      <dl className="mx-auto mt-10 grid max-w-2xl gap-4 text-left sm:grid-cols-2">
        {filterInstructionSteps.map((step) => (
          <div
            key={step.title}
            className="flex items-start gap-3 rounded-xl border border-border bg-background p-5"
          >
            <Icon name={step.icon} className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <dt className="text-sm font-semibold text-foreground">{step.title}</dt>
              <dd className="mt-0.5 text-sm text-muted">{step.description}</dd>
            </div>
          </div>
        ))}
      </dl>
      {/* Escape hatch for visitors who would rather browse than narrow —
          placed after the filter guidance, as the alternative to it. */}
      <div className="mt-10">
        <Button onClick={onShowAll}>Show all resources</Button>
      </div>
    </div>
  );
}

function EmptyLibrary() {
  return (
    <div className="flex min-h-128 flex-col justify-center rounded-2xl border border-dashed border-border bg-surface p-16 text-center">
      <Icon name="book" className="mx-auto h-10 w-10 text-muted" />
      <h2 className="mt-6 font-serif text-2xl text-foreground">No resources published yet</h2>
      <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">
        Curriculum materials will appear here once they have been added to the
        resource library.
      </p>
    </div>
  );
}

export function CurriculumExplorer({
  vocabulary,
  resources,
}: {
  vocabulary: CurriculumVocabulary;
  resources: CurriculumResource[];
}) {
  const searchParams = useSearchParams();
  // Education level is a filter like any other, and like the others it is
  // off by default: nothing is scoped by level unless a visitor asks for
  // it, since scoping silently hides other levels' material and anything an
  // editor left unclassified. The Coverage Map keeps its own level (it can
  // only plot one at a time), seeded from the filter when there is one.
  //
  // Landing state comes from the URL so a link can arrive pre-narrowed —
  // the home page's level tiles link to `/resources?level=primary`. Read
  // once: from here on the filters are this component's own state.
  const [filters, setFilters] = useState<CurriculumFilters>(() =>
    filtersFromSearchParams(searchParams, vocabulary),
  );
  const [mapLevel, setMapLevel] = useState<string | null>(filters.levelSlug);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showFilters, setShowFilters] = useState(true);
  // Set by "Show all resources" on the landing card, and sticky once set:
  // having opted into browsing, nobody wants to be dropped back onto an
  // instructions screen when they clear a filter.
  const [showAll, setShowAll] = useState(false);

  // Sidebar options span every level; the map's axes are scoped to its own.
  const subjects = useMemo(() => getSubjects(vocabulary, null), [vocabulary]);
  const yearLevels = useMemo(() => getYearLevels(vocabulary, null), [vocabulary]);
  const mapSubjects = useMemo(
    () => getSubjects(vocabulary, mapLevel),
    [vocabulary, mapLevel],
  );
  const mapYearLevels = useMemo(
    () => getYearLevels(vocabulary, mapLevel),
    [vocabulary, mapLevel],
  );

  const filteredResources = useMemo(
    () => filterResources(resources, filters.levelSlug, filters),
    [resources, filters],
  );

  const hasActiveFilters = Boolean(
    filters.levelSlug ||
      filters.type ||
      filters.subjectSlug ||
      filters.yearLevelSlug ||
      filters.query
  );

  function handleLevelChange(next: string) {
    setMapLevel(next);
  }

  function handleFilterChange(patch: Partial<CurriculumFilters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setViewMode("list");
  }

  function handleCellClick(subjectSlug: string, yearLevelSlug: string) {
    // The cell's count is scoped to the map's level, so carry that into the
    // filters — otherwise the list returns more than the number clicked.
    setFilters({
      levelSlug: mapLevel,
      type: null,
      subjectSlug,
      yearLevelSlug,
      query: "",
    });
    setViewMode("list");
  }

  function handleShowMap() {
    // The map needs a concrete level; land on one that has material rather
    // than an empty grid.
    if (!mapLevel) setMapLevel(firstPopulatedLevel(vocabulary, resources));
    setViewMode("map");
  }

  function handleBackToList() {
    setViewMode("list");
  }

  // Remounts the count line and the list so their entry animations replay
  // whenever the filter set changes.
  const filterKey = [
    filters.levelSlug ?? "",
    filters.type ?? "",
    filters.subjectSlug ?? "",
    filters.yearLevelSlug ?? "",
    filters.query,
  ].join("-");

  const activeLevel = vocabulary.levels.find((l) => l.slug === filters.levelSlug);
  const activeSubject = subjects.find((s) => s.slug === filters.subjectSlug);
  const activeYearLevel = yearLevels.find((y) => y.slug === filters.yearLevelSlug);
  const activeType = vocabulary.resourceTypes.find((t) => t.value === filters.type);

  if (resources.length === 0) {
    return (
      <div className="mx-auto w-full max-w-8xl px-6 py-12">
        <EmptyLibrary />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-8xl flex-col gap-8 px-6 py-12 lg:flex-row">
      <MobileFilterIsland
        levels={vocabulary.levels}
        resourceTypes={vocabulary.resourceTypes}
        subjects={subjects}
        yearLevels={yearLevels}
        filters={filters}
        onFilterChange={handleFilterChange}
        onShowMap={handleShowMap}
      />

      {showFilters && (
        <CurriculumSidebar
          levels={vocabulary.levels}
          resourceTypes={vocabulary.resourceTypes}
          subjects={subjects}
          yearLevels={yearLevels}
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
              {vocabulary.levels.map((tab) => (
                <button
                  key={tab.slug}
                  type="button"
                  role="tab"
                  aria-selected={mapLevel === tab.slug}
                  onClick={() => handleLevelChange(tab.slug)}
                  className={cn(
                    "-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    mapLevel === tab.slug
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-foreground"
                  )}
                >
                  {tab.name}
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
                Coverage across every subject and year level. Select a number to
                see the resources published for that subject and year.
              </p>
            </div>
          ) : (
            <p
              key={`${filterKey}-${showAll}`}
              className="animate-in fade-in-0 slide-in-from-top-1 ml-auto text-sm text-muted duration-300"
              aria-live="polite"
            >
              {hasActiveFilters ? (
                <>
                  {filteredResources.length} {filteredResources.length === 1 ? "resource" : "resources"}
                  {activeLevel && <> · {activeLevel.name}</>}
                  {activeSubject && <> · {activeSubject.name}</>}
                  {activeYearLevel && <> · {activeYearLevel.label}</>}
                  {activeType && <> · {activeType.label}</>}
                  {filters.query && <> · &ldquo;{filters.query}&rdquo;</>}
                </>
              ) : showAll ? (
                <>
                  All {filteredResources.length}{" "}
                  {filteredResources.length === 1 ? "resource" : "resources"} · newest first
                </>
              ) : (
                <>Use the filters to find resources</>
              )}
            </p>
          )}
        </div>

        <div className="mt-6 pb-24 lg:pb-0">
          {viewMode === "map" ? (
            <CoverageMap
              subjects={mapSubjects}
              yearLevels={mapYearLevels}
              countFor={(subjectSlug, yearLevelSlug) =>
                countCoverage(resources, mapLevel ?? "", subjectSlug, yearLevelSlug)
              }
              onCellClick={handleCellClick}
            />
          ) : hasActiveFilters || showAll ? (
            // With no filters applied this is the whole library, already
            // ordered newest-first by filterResources.
            <CurriculumResourceList
              key={filterKey}
              resources={filteredResources}
              yearLevels={yearLevels}
            />
          ) : (
            <FilterInstructions onShowAll={() => setShowAll(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
