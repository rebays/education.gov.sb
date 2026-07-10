import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { Grade, Subject } from "@/app/lib/curriculum";

function intensityClass(count: number): string {
  if (count === 0) return "";
  if (count === 1) return "bg-primary/10 text-primary hover:bg-primary/20";
  if (count <= 3) return "bg-primary/20 text-primary hover:bg-primary/30";
  return "bg-primary/30 text-primary hover:bg-primary/40";
}

export function CoverageMap({
  subjects,
  grades,
  countFor,
  onCellClick,
}: {
  subjects: Subject[];
  grades: Grade[];
  countFor: (subjectId: string, gradeId: string) => number;
  onCellClick: (subjectId: string, gradeId: string) => void;
}) {
  return (
    <div className="relative">
      {/* mobile-only affordance — the table is always wider than a phone
          screen, so call out that it scrolls sideways */}
      <p className="mb-2 flex items-center gap-1.5 text-xs text-muted sm:hidden">
        <Icon name="arrow" className="h-3.5 w-3.5" />
        Swipe to see more subjects and grades
      </p>

      <div className="relative overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-140 border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="sticky left-0 z-10 min-w-28 bg-surface px-3 py-3 font-semibold text-foreground sm:min-w-50 sm:px-5">
                  Subject
                </th>
                {grades.map((g) => (
                  <th
                    key={g.id}
                    scope="col"
                    className="px-2 py-3 text-center font-semibold text-foreground sm:px-3"
                  >
                    {g.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subjects.map((s) => (
                <tr key={s.id} className="bg-background">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-background px-3 py-3 text-left font-medium text-foreground sm:px-5"
                  >
                    {s.name}
                  </th>
                  {grades.map((g) => {
                    const count = countFor(s.id, g.id);
                    return (
                      <td key={g.id} className="px-2 py-2 text-center sm:px-3">
                        {count > 0 ? (
                          <button
                            type="button"
                            onClick={() => onCellClick(s.id, g.id)}
                            className={cn(
                              "inline-flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:h-9 sm:w-9",
                              intensityClass(count)
                            )}
                            aria-label={`${count} ${count === 1 ? "resource" : "resources"} for ${s.name}, ${g.label}`}
                          >
                            {count}
                          </button>
                        ) : (
                          <span className="inline-flex h-8 w-8 items-center justify-center font-mono text-sm text-muted/50 sm:h-9 sm:w-9" aria-hidden>
                            –
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* right-edge fade hints that there's more to scroll to */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-background/80 to-transparent sm:hidden"
        />
      </div>
    </div>
  );
}
