import { cn } from "@/lib/utils";
import type { Grade, Subject } from "../../lib/curriculum";

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
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            <th className="sticky left-0 z-10 min-w-[200px] bg-surface px-5 py-3 font-semibold text-foreground">
              Subject
            </th>
            {grades.map((g) => (
              <th
                key={g.id}
                scope="col"
                className="px-3 py-3 text-center font-semibold text-foreground"
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
                className="sticky left-0 z-10 bg-background px-5 py-3 text-left font-medium text-foreground"
              >
                {s.name}
              </th>
              {grades.map((g) => {
                const count = countFor(s.id, g.id);
                return (
                  <td key={g.id} className="px-3 py-2 text-center">
                    {count > 0 ? (
                      <button
                        type="button"
                        onClick={() => onCellClick(s.id, g.id)}
                        className={cn(
                          "inline-flex h-9 w-9 items-center justify-center rounded-lg font-mono text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          intensityClass(count)
                        )}
                        aria-label={`${count} ${count === 1 ? "resource" : "resources"} for ${s.name}, ${g.label}`}
                      >
                        {count}
                      </button>
                    ) : (
                      <span className="inline-flex h-9 w-9 items-center justify-center font-mono text-sm text-muted/50" aria-hidden>
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
  );
}
