import { cn } from "@/lib/utils"

/**
 * The Classic design system's bespoke icon set — line only, 1.5px stroke,
 * 24px grid, round caps and joins. Unfilled and inherits currentColor.
 */
export const icons = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4",
  document: "M7 3h7l4 4v14H7V3ZM14 3v4h4M9.5 13h5M9.5 16.5h5",
  report: "M5 21V5a2 2 0 0 1 2-2h7l5 5v13H5ZM8 14v3M12 11v6M16 13v4",
  video: "M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4V6ZM17 10l4-2v8l-4-2",
  book: "M5 4h9a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4ZM16 6v14",
  graduation: "M12 4 2 9l10 5 10-5-10-5ZM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5",
  download: "M12 4v11M8 11l4 4 4-4M5 20h14",
  external: "M14 5h5v5M19 5l-8 8M18 14v5H5V6h5",
  calendar: "M4 6h16v14H4V6ZM8 3v4M16 3v4M4 10h16",
  mail: "M4 6h16v12H4V6ZM4 7l8 6 8-6",
  phone: "M6 3l3 1 1 4-2 2a11 11 0 0 0 5 5l2-2 4 1 1 3a2 2 0 0 1-2 2A16 16 0 0 1 5 5a2 2 0 0 1 1-2Z",
  filter: "M4 5h16l-6 7v6l-4 2v-8L4 5Z",
  chevron: "M9 6l6 6-6 6",
  check: "M5 12l4 4 10-10",
  close: "M6 6l12 12M18 6 6 18",
  menu: "M4 7h16M4 12h16M4 17h16",
  arrow: "M5 12h14M13 6l6 6-6 6",
  star: "M12 4l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8L12 4Z",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.4 3.5 5.6 3.5 9s-1 6.6-3.5 9c-2.5-2.4-3.5-5.6-3.5-9S9.5 5.4 12 3Z",
  bookmark: "M6 3h12v18l-6-4-6 4V3Z",
  share: "M7 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM22 6a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM22 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM7 12l10-5.5M7 12l10 5.5",
  print: "M7 8V3h10v5M7 18H5v-6h14v6h-2M8 14h8v6H8v-6Z",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  tag: "M4 4h7l9 9-7 7-9-9V4Z M7.5 7.5v.01",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v6M12 7.5v.5",
  expand: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5",
} as const

export type IconName = keyof typeof icons

function Icon({
  name,
  className,
}: {
  name: IconName
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5", className)}
      aria-hidden
    >
      <path d={icons[name]} />
    </svg>
  )
}

export { Icon }
