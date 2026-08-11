import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  CurriculumFilters,
  ResourceTypeChoice,
  Subject,
  YearLevel,
} from "@/lib/curriculum";

function FilterSelect<T extends string>({
  id,
  label,
  options,
  active,
  onChange,
  optionLabel,
}: {
  id: string;
  label: string;
  options: T[];
  active: T | null;
  onChange: (value: T | null) => void;
  optionLabel: (value: T) => string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70">
        {label}
      </Label>
      <Select value={active} onValueChange={(value) => onChange(value as T | null)}>
        <SelectTrigger id={id}>
          <SelectValue>{(value: T | null) => (value ? optionLabel(value) : "All")}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>All</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {optionLabel(opt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CurriculumSidebar({
  resourceTypes,
  subjects,
  yearLevels,
  filters,
  onFilterChange,
  onReset,
  onShowMap,
  onBackToList,
  isMapOpen = false,
}: {
  resourceTypes: ResourceTypeChoice[];
  subjects: Subject[];
  yearLevels: YearLevel[];
  filters: CurriculumFilters;
  onFilterChange: (patch: Partial<CurriculumFilters>) => void;
  onReset: () => void;
  onShowMap: () => void;
  onBackToList: () => void;
  /** Coverage Map is currently shown — swaps the button into a "back" toggle. */
  isMapOpen?: boolean;
}) {
  const hasActiveFilters =
    filters.type || filters.subjectSlug || filters.yearLevelSlug || filters.query;

  return (
    <aside className="hidden w-full shrink-0 flex-col gap-5 lg:sticky lg:top-24 lg:flex lg:w-64 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div>
        <Label
          htmlFor="filter-search"
          className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70"
        >
          Search
        </Label>
        <div className="relative">
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted"
          />
          <input
            id="filter-search"
            type="search"
            value={filters.query}
            onChange={(e) => onFilterChange({ query: e.target.value })}
            placeholder="Search resources…"
            aria-label="Search curriculum resources"
            className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <FilterSelect
        id="filter-resource-type"
        label="Resource type"
        options={resourceTypes.map((t) => t.value)}
        active={filters.type}
        onChange={(type) => onFilterChange({ type })}
        optionLabel={(value) =>
          resourceTypes.find((t) => t.value === value)?.label ?? value
        }
      />

      <FilterSelect
        id="filter-subject"
        label="Subject"
        options={subjects.map((s) => s.slug)}
        active={filters.subjectSlug}
        onChange={(subjectSlug) => onFilterChange({ subjectSlug })}
        optionLabel={(slug) => subjects.find((s) => s.slug === slug)?.name ?? slug}
      />

      {yearLevels.length > 0 && (
        <FilterSelect
          id="filter-year-level"
          label="Grade / year level"
          options={yearLevels.map((y) => y.slug)}
          active={filters.yearLevelSlug}
          onChange={(yearLevelSlug) => onFilterChange({ yearLevelSlug })}
          optionLabel={(slug) =>
            yearLevels.find((y) => y.slug === slug)?.label ?? slug
          }
        />
      )}

      <Button
        variant="secondary"
        className="w-full"
        onClick={isMapOpen ? onBackToList : onShowMap}
      >
        <Icon
          name={isMapOpen ? "arrow" : "grid"}
          className={cn("h-4 w-4", isMapOpen && "rotate-180")}
        />
        {isMapOpen ? "Back to resource list" : "Coverage Map"}
      </Button>
    </aside>
  );
}
