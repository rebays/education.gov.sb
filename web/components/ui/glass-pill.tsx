import Link from "next/link"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Frosted-glass pill link for dark surfaces — white at 10% with backdrop
 * blur and a soft border, brightening on hover. Used for suggested searches
 * under the hero and the 404 page's quick links.
 */
function GlassPill({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md transition-colors hover:border-white/40 hover:bg-white/20 hover:text-white",
        className
      )}
    >
      {children}
    </Link>
  )
}

export { GlassPill }
