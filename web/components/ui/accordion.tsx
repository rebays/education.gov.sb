"use client"

import Image from "next/image"
import { useId, useState } from "react"

import { cn } from "@/lib/utils"

type AccordionItem = {
  title: string
  description: string
}

type AccordionProps = {
  items: AccordionItem[]
  /** Controlled open index — one panel is always open (selection, not toggle). */
  active?: number
  onActiveChange?: (index: number) => void
  /** Heading level for row titles, so the accordion nests correctly in the page outline. */
  headingLevel?: "h3" | "h4"
  className?: string
}

/**
 * The hub's selection accordion — hairline-ruled rows with serif titles, a
 * rotating chevron, and a smooth grid-rows height animation. One panel is
 * always open; picking a row selects it rather than toggling it closed.
 */
function Accordion({
  items,
  active,
  onActiveChange,
  headingLevel: Heading = "h3",
  className,
}: AccordionProps) {
  const [internalActive, setInternalActive] = useState(0)
  const activeIndex = active ?? internalActive
  const baseId = useId()

  return (
    <ul className={cn("border-t border-border", className)}>
      {items.map((item, i) => {
        const isActive = i === activeIndex
        const panelId = `${baseId}-panel-${i}`
        return (
          <li key={item.title} className="border-b border-border">
            <Heading>
              <button
                type="button"
                onClick={() => {
                  setInternalActive(i)
                  onActiveChange?.(i)
                }}
                aria-expanded={isActive}
                aria-controls={panelId}
                className="group flex w-full items-center gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span
                  className={cn(
                    "flex-1 font-serif text-xl transition-colors sm:text-2xl",
                    isActive
                      ? "text-primary"
                      : "text-foreground group-hover:text-primary"
                  )}
                >
                  {item.title}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-300",
                    isActive ? "rotate-180 text-primary" : "text-muted"
                  )}
                  aria-hidden
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </Heading>
            <div
              id={panelId}
              className={cn(
                "grid transition-all duration-300 ease-out",
                isActive
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-md pb-6 text-base leading-7 text-muted">
                  {item.description}
                </p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

type MediaAccordionItem = AccordionItem & {
  image: string
  imageAlt?: string
  /** Short audience label shown as a glass pill over the image. */
  tag?: string
}

type MediaAccordionProps = {
  items: MediaAccordionItem[]
  headingLevel?: "h3" | "h4"
  className?: string
}

/**
 * Accordion with a companion media panel — the open row drives a crossfading
 * image on the right, captioned with the row's tag and title.
 */
function MediaAccordion({ items, headingLevel, className }: MediaAccordionProps) {
  const [active, setActive] = useState(0)

  return (
    <div
      className={cn(
        "grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-stretch",
        className
      )}
    >
      <Accordion
        items={items}
        active={active}
        onActiveChange={setActive}
        headingLevel={headingLevel}
      />

      <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-border shadow-sm lg:min-h-full">
        {items.map((item, i) => (
          <Image
            key={item.title}
            src={item.image}
            alt={item.imageAlt ?? item.title}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={cn(
              "object-cover transition-opacity duration-500",
              i === active ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          {items[active].tag && (
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              {items[active].tag}
            </span>
          )}
          <p className="mt-3 font-serif text-2xl leading-snug">
            {items[active].title}
          </p>
        </div>
      </div>
    </div>
  )
}

export { Accordion, MediaAccordion }
export type { AccordionItem, AccordionProps, MediaAccordionItem, MediaAccordionProps }
