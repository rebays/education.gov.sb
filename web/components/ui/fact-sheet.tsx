import { cn } from "@/lib/utils"

type FactSheetProps = {
  /** [label, value] rows — labels uppercase left, mono values right. */
  facts: ReadonlyArray<readonly [string, string]>
  className?: string
}

/**
 * The spec table on resource and publication records: uppercase labels left,
 * mono values right, hairline-ruled rows. Mono is for data — never decoration.
 */
function FactSheet({ facts, className }: FactSheetProps) {
  return (
    <dl className={cn("space-y-3.5", className)}>
      {facts.map(([label, value]) => (
        <div
          key={label}
          className="flex items-baseline justify-between gap-4 border-b border-border/70 pb-3 last:border-0 last:pb-0"
        >
          <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted">
            {label}
          </dt>
          <dd className="text-right font-mono text-sm text-foreground">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export { FactSheet }
export type { FactSheetProps }
