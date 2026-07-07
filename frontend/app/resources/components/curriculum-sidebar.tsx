import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Grade, ResourceType, Subject } from "../../lib/curriculum";

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
      <NativeSelect
        id={id}
        className="w-full"
        value={active ?? ""}
        onChange={(e) => onChange((e.target.value || null) as T | null)}
      >
        <NativeSelectOption value="">All</NativeSelectOption>
        {options.map((opt) => (
          <NativeSelectOption key={opt} value={opt}>
            {optionLabel(opt)}
          </NativeSelectOption>
        ))}
      </NativeSelect>
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
}: {
  resourceTypes: ResourceType[];
  subjects: Subject[];
  grades: Grade[];
  filters: CurriculumFilters;
  onFilterChange: (patch: Partial<CurriculumFilters>) => void;
  onReset: () => void;
  onShowMap: () => void;
}) {
  const hasActiveFilters = filters.type || filters.subjectId || filters.gradeId || filters.query;

  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-64">
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

      <Button variant="secondary" className="w-full" onClick={onShowMap}>
        <Icon name="grid" className="h-4 w-4" />
        Coverage Map
      </Button>
    </aside>
  );
}
