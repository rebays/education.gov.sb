import Link from "next/link"
import type { CSSProperties } from "react"

import { Badge, type badgeVariants } from "@/components/ui/badge"
import { Icon, type IconName } from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"

type ResourceCardBadge = {
  label: string
  tone?: VariantProps<typeof badgeVariants>["variant"]
  icon?: IconName
}

type ResourceCardBase = {
  title: string
  description: string
  meta: string
  badges: ResourceCardBadge[]
  className?: string
  style?: CSSProperties
  /** Wraps the title in a link, e.g. to a detail page. */
  href?: string
}

type ResourceCardProps = ResourceCardBase &
  (
    | { variant: "document" | "report"; icon: IconName }
    | { variant: "video"; duration: string }
  )

/**
 * The hub's core listing unit — documents, reports, and videos share this
 * shell. The card's single action is navigation: when `href` is set the
 * whole card is clickable via the stretched title link (an `after`
 * overlay). Downloads deliberately live on the detail page, where a
 * multi-file resource can present each file with context.
 */
function ResourceCard(props: ResourceCardProps) {
  const { title, description, meta, badges, className, style, href } = props

  return (
    <article
      style={style}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl",
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary has-[a:focus-visible]:ring-offset-2",
        className
      )}
    >
      {props.variant === "video" ? (
        <div className="relative flex aspect-video items-center justify-center bg-deep">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur transition-transform group-hover:scale-110">
            <Icon name="video" className="h-6 w-6" />
          </span>
          <span className="absolute bottom-3 right-3 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[11px] text-white">
            {props.duration}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 border-b border-border bg-surface px-5 py-4">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              props.icon === "report"
                ? "bg-accent/20 text-accent-ink"
                : "bg-primary/10 text-primary"
            )}
          >
            <Icon name={props.icon} className="h-5 w-5" />
          </span>
          <div className="flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <Badge key={b.label} variant={b.tone}>
                {b.icon && <Icon name={b.icon} className="h-3.5 w-3.5" />}
                {b.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {props.variant === "video" && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <Badge key={b.label} variant={b.tone}>
                {b.icon && <Icon name={b.icon} className="h-3.5 w-3.5" />}
                {b.label}
              </Badge>
            ))}
          </div>
        )}
        <h4 className="font-serif text-xl leading-snug text-foreground group-hover:text-primary">
          {href ? (
            <Link
              href={href}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h4>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{description}</p>
        <p className="mt-4 font-mono text-[12px] text-muted">{meta}</p>
      </div>
    </article>
  )
}

export { ResourceCard }
export type { ResourceCardProps, ResourceCardBadge }
