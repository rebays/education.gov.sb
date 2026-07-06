import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

function SearchBar({
  className,
  inputProps,
  buttonLabel = "Search",
  ...props
}: React.ComponentProps<"form"> & {
  inputProps?: React.ComponentProps<"input">
  buttonLabel?: string
}) {
  return (
    <form role="search" className={cn("flex flex-col gap-3 sm:flex-row", className)} {...props}>
      <div className="relative flex-1">
        <Icon
          name="search"
          className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          aria-label={inputProps?.["aria-label"] ?? buttonLabel}
          placeholder="Search documents, reports, videos…"
          {...inputProps}
          className={cn(
            "h-12 w-full rounded-lg border border-border bg-background pl-12 pr-4 text-[15px] text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
            inputProps?.className
          )}
        />
      </div>
      <Button type="submit" size="lg" variant="primary">
        {buttonLabel}
      </Button>
    </form>
  )
}

export { SearchBar }
