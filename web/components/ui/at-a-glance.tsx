import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

/**
 * Check-marked key points shown above a record's body — the skimmable
 * summary before the full text.
 */
function AtAGlance({
  points,
  title = "At a glance",
  className,
}: {
  points: string[]
  title?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "max-w-2xl rounded-2xl border border-border bg-surface p-6",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {points.map((point) => (
          <li key={point} className="flex gap-3 text-sm leading-6 text-foreground">
            <Icon name="check" className="mt-1 size-4 shrink-0 text-primary" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  )
}

export { AtAGlance }
