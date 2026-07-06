import { cn } from "@/lib/utils";
import type { Grade, ResourceType, Subject } from "../../lib/curriculum";

function FilterGroup<T extends string>({
  label,
  options,
  active,
  onChange,
  optionLabel,
}: {
  label: string;
  options: T[];
  active: T | null;
  onChange: (value: T | null) => void;
  optionLabel: (value: T) => string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70">
        {label}
      </legend>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-pressed={active === null}
          className={cn(
            "rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            active === null ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface-2 hover:text-foreground"
          )}
        >
          All
        </button>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={active === opt}
            className={cn(
              "rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              active === opt ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface-2 hover:text-foreground"
            )}
          >
            {optionLabel(opt)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export type CurriculumFilters = {
  type: ResourceType | null;
  subjectId: string | null;
  gradeId: string | null;
};

export function CurriculumSidebar({
  resourceTypes,
  subjects,
  grades,
  filters,
  onFilterChange,
  onReset,
}: {
  resourceTypes: ResourceType[];
  subjects: Subject[];
  grades: Grade[];
  filters: CurriculumFilters;
  onFilterChange: (patch: Partial<CurriculumFilters>) => void;
  onReset: () => void;
}) {
  const hasActiveFilters = filters.type || filters.subjectId || filters.gradeId;

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-64">
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

      <FilterGroup
        label="Resource type"
        options={resourceTypes}
        active={filters.type}
        onChange={(type) => onFilterChange({ type })}
        optionLabel={(t) => t}
      />

      <FilterGroup
        label="Subject"
        options={subjects.map((s) => s.id)}
        active={filters.subjectId}
        onChange={(subjectId) => onFilterChange({ subjectId })}
        optionLabel={(id) => subjects.find((s) => s.id === id)?.name ?? id}
      />

      <FilterGroup
        label="Grade / year level"
        options={grades.map((g) => g.id)}
        active={filters.gradeId}
        onChange={(gradeId) => onFilterChange({ gradeId })}
        optionLabel={(id) => grades.find((g) => g.id === id)?.label ?? id}
      />
    </aside>
  );
}
