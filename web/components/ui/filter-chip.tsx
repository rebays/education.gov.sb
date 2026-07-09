import type { ButtonHTMLAttributes } from "react"

import { cn } from "@/lib/utils"

/**
 * A type chip in an in-place filter bar — the active chip fills primary,
 * the rest sit on the surface tone.
 */
function FilterChip({
  active = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-surface text-foreground hover:bg-surface-2",
        className
      )}
      {...props}
    />
  )
}

export { FilterChip }
