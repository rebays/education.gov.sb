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
import type { Grade, ResourceType, Subject } from "@/app/lib/curriculum";

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

export type CurriculumFilters = {
  type: ResourceType | null;
  subjectId: string | null;
  gradeId: string | null;
  query: string;
};

export function CurriculumSidebar({
  resourceTypes,
  subjects,
  grades,
  filters,
  onFilterChange,
  onReset,
  onShowMap,
  onBackToList,
  isMapOpen = false,
}: {
  resourceTypes: ResourceType[];
  subjects: Subject[];
  grades: Grade[];
  filters: CurriculumFilters;
  onFilterChange: (patch: Partial<CurriculumFilters>) => void;
  onReset: () => void;
  onShowMap: () => void;
  onBackToList: () => void;
  /** Coverage Map is currently shown — swaps the button into a "back" toggle. */
  isMapOpen?: boolean;
}) {
  const hasActiveFilters = filters.type || filters.subjectId || filters.gradeId || filters.query;

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
        options={resourceTypes}
        active={filters.type}
        onChange={(type) => onFilterChange({ type })}
        optionLabel={(t) => t}
      />

      <FilterSelect
        id="filter-subject"
        label="Subject"
        options={subjects.map((s) => s.id)}
        active={filters.subjectId}
        onChange={(subjectId) => onFilterChange({ subjectId })}
        optionLabel={(id) => subjects.find((s) => s.id === id)?.name ?? id}
      />

      <FilterSelect
        id="filter-grade"
        label="Grade / year level"
        options={grades.map((g) => g.id)}
        active={filters.gradeId}
        onChange={(gradeId) => onFilterChange({ gradeId })}
        optionLabel={(id) => grades.find((g) => g.id === id)?.label ?? id}
      />

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
