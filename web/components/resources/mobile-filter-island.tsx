"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Grade, ResourceType, Subject } from "@/app/lib/curriculum";
import type { CurriculumFilters } from "./curriculum-sidebar";

type PickerKey = "search" | "type" | "subject" | "grade";

/**
 * Mobile replacement for `CurriculumSidebar` — a floating bottom dock with
 * one icon per filter. Tapping an icon opens a bottom sheet with that
 * filter's options (or, for search, a text field). `CurriculumSidebar`
 * itself is hidden below `lg`, so this is the only way to filter on
 * mobile — and the only way to reach the Coverage Map, since that button
 * normally lives inside the now-hidden sidebar too.
 */
export function MobileFilterIsland({
  resourceTypes,
  subjects,
  grades,
  filters,
  onFilterChange,
  onShowMap,
}: {
  resourceTypes: ResourceType[];
  subjects: Subject[];
  grades: Grade[];
  filters: CurriculumFilters;
  onFilterChange: (patch: Partial<CurriculumFilters>) => void;
  onShowMap: () => void;
}) {
  const [openPicker, setOpenPicker] = useState<PickerKey | null>(null);
  const [searchDraft, setSearchDraft] = useState(filters.query);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeSubject = subjects.find((s) => s.id === filters.subjectId);
  const activeGrade = grades.find((g) => g.id === filters.gradeId);

  const items: { key: PickerKey; category: string; value: string | null; icon: IconName }[] = [
    { key: "search", category: "Search", value: filters.query || null, icon: "search" },
    { key: "type", category: "Type", value: filters.type, icon: "tag" },
    { key: "subject", category: "Subject", value: activeSubject?.name ?? null, icon: "book" },
    { key: "grade", category: "Grade", value: activeGrade?.label ?? null, icon: "graduation" },
  ];

  function openSheet(key: PickerKey) {
    if (key === "search") setSearchDraft(filters.query);
    setOpenPicker(key);
  }

  return (
    <>
      {/* rendered as the first child right at the top of the content
          column, then pulled up with a negative margin so its natural
          resting position straddles the seam between PageHeader and the
          white content below — half sunk into the navy band, half into
          the content. `sticky` keeps it reachable once you scroll past
          that point instead of it scrolling away. */}
      <div className="sticky top-24 z-40 -mt-20 mb-6 flex justify-center px-4 lg:hidden">
        <div className="flex items-center gap-0.5 rounded-3xl border border-border bg-background/95 p-1.5 shadow-xl backdrop-blur">
          {items.map((item) => {
            const active = item.value !== null;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => openSheet(item.key)}
                aria-label={active ? `${item.category}: ${item.value}` : item.category}
                className={cn(
                  "relative flex min-w-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"
                )}
              >
                <Icon name={item.icon} className="h-5 w-5" />
                <span aria-hidden className="max-w-14 truncate text-[10px] leading-none font-medium">
                  {item.value ?? item.category}
                </span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute top-1 right-2 h-2 w-2 rounded-full bg-accent ring-2 ring-background"
                  />
                )}
              </button>
            );
          })}

          <span aria-hidden className="mx-0.5 h-8 w-px bg-border" />

          <button
            type="button"
            onClick={onShowMap}
            className="flex min-w-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <Icon name="grid" className="h-5 w-5" />
            <span className="text-[10px] leading-none font-medium">Map</span>
          </button>
        </div>
      </div>

      <OptionSheet
        open={openPicker === "type"}
        onOpenChange={(open) => setOpenPicker(open ? "type" : null)}
        title="Resource type"
        options={resourceTypes}
        active={filters.type}
        optionLabel={(t) => t}
        onSelect={(value) => {
          onFilterChange({ type: value });
          setOpenPicker(null);
        }}
      />

      <OptionSheet
        open={openPicker === "subject"}
        onOpenChange={(open) => setOpenPicker(open ? "subject" : null)}
        title="Subject"
        options={subjects.map((s) => s.id)}
        active={filters.subjectId}
        optionLabel={(id) => subjects.find((s) => s.id === id)?.name ?? id}
        onSelect={(value) => {
          onFilterChange({ subjectId: value });
          setOpenPicker(null);
        }}
      />

      <OptionSheet
        open={openPicker === "grade"}
        onOpenChange={(open) => setOpenPicker(open ? "grade" : null)}
        title="Grade / year level"
        options={grades.map((g) => g.id)}
        active={filters.gradeId}
        optionLabel={(id) => grades.find((g) => g.id === id)?.label ?? id}
        onSelect={(value) => {
          onFilterChange({ gradeId: value });
          setOpenPicker(null);
        }}
      />

      <Sheet
        open={openPicker === "search"}
        onOpenChange={(open) => setOpenPicker(open ? "search" : null)}
        onOpenChangeComplete={(open) => {
          // Focusing before the slide-in transition finishes pops the
          // on-screen keyboard mid-animation, which resizes the visual
          // viewport and made the sheet appear to jump/hide on real
          // mobile devices. Focus only once the sheet has fully settled.
          if (open) searchInputRef.current?.focus();
        }}
      >
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetTitle className="sr-only">Search resources</SheetTitle>
          <SheetHeader className="border-b border-border">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70">Search</p>
          </SheetHeader>
          <form
            className="p-5"
            onSubmit={(e) => {
              e.preventDefault();
              onFilterChange({ query: searchDraft });
              setOpenPicker(null);
            }}
          >
            <div className="relative">
              <Icon
                name="search"
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted"
              />
              <input
                ref={searchInputRef}
                type="search"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search resources…"
                className="h-12 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-base text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <Button type="submit" className="mt-4 w-full">
              Search
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

function OptionSheet<T extends string>({
  open,
  onOpenChange,
  title,
  options,
  active,
  optionLabel,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: T[];
  active: T | null;
  optionLabel: (value: T) => string;
  onSelect: (value: T | null) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[70vh] rounded-t-2xl">
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <SheetHeader className="border-b border-border">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70">{title}</p>
        </SheetHeader>
        <div className="overflow-y-auto p-3">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-[15px] font-medium transition-colors",
              active === null ? "bg-primary/10 text-primary" : "text-foreground hover:bg-surface-2"
            )}
          >
            All
            {active === null && <Icon name="check" className="h-4 w-4" />}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-[15px] font-medium transition-colors",
                active === opt ? "bg-primary/10 text-primary" : "text-foreground hover:bg-surface-2"
              )}
            >
              {optionLabel(opt)}
              {active === opt && <Icon name="check" className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
