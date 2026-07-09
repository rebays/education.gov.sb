import { forwardRef, useState, type InputHTMLAttributes } from "react"

import { Icon } from "@/components/ui/icon"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

/**
 * The workaday search treatment: a compact rounded-lg field with the icon
 * inset left. Used in the inner-page header and to scope listings in
 * filter bars. `className` sizes the wrapper; `inputClassName` re-tones
 * the field (e.g. bg-background inside filter bars).
 *
 * `shortcutHint` shows an "S" kbd badge on the right while the field is
 * empty and unfocused — pair it with `useSearchShortcut` on the same ref.
 */
const SearchField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    inputClassName?: string
    shortcutHint?: boolean
  }
>(function SearchField(
  { className, inputClassName, shortcutHint = false, ...props },
  ref
) {
  const [focused, setFocused] = useState(false)
  const [hasText, setHasText] = useState(
    Boolean(props.defaultValue ?? props.value)
  )
  const showHint = shortcutHint && !focused && !hasText

  return (
    <div className={cn("relative", className)}>
      <Icon
        name="search"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
      <input
        ref={ref}
        type="search"
        {...props}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          props.onBlur?.(e)
        }}
        onChange={(e) => {
          setHasText(e.target.value.length > 0)
          props.onChange?.(e)
        }}
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-surface pl-10 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
          shortcutHint ? "pr-9" : "pr-4",
          inputClassName
        )}
      />
      {showHint && (
        <Kbd className="absolute right-3 top-1/2 -translate-y-1/2 border-border bg-background text-muted">
          S
        </Kbd>
      )}
    </div>
  )
})

export { SearchField }
