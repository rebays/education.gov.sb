import type { InputHTMLAttributes } from "react"

import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

/**
 * The workaday search treatment: a compact rounded-lg field with the icon
 * inset left. Used in the inner-page header and to scope listings in
 * filter bars. `className` sizes the wrapper; `inputClassName` re-tones
 * the field (e.g. bg-background inside filter bars).
 */
function SearchField({
  className,
  inputClassName,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { inputClassName?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Icon
        name="search"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        {...props}
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
          inputClassName
        )}
      />
    </div>
  )
}

export { SearchField }
