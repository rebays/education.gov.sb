import Image from "next/image";
import Link from "next/link";

/**
 * Shared site header.
 *
 * `variant="overlay"` — transparent, white text; for pages with a full-bleed
 * hero behind the header (the landing page).
 * `variant="solid"` — opaque background with a hairline border; sticky, for
 * all inner pages.
 */

const primaryNav = [
  { label: "Resources", href: "/resources" },
  { label: "Publications", href: "/publications" },
  { label: "News", href: "/news" },
  { label: "About", href: "/about" },
];

export default function SiteHeader({
  variant = "solid",
}: {
  variant?: "overlay" | "solid";
}) {
  const overlay = variant === "overlay";

  const linkCls = overlay
    ? "text-white hover:text-accent"
    : "text-muted hover:text-primary";

  return (
    <header
      className={
        overlay
          ? "relative"
          : "sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur"
      }
    >
      <div className="mx-auto flex w-full max-w-8xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/coa-si.webp"
            alt="Solomon Islands coat of arms"
            width={40}
            height={40}
            className="h-10 w-auto shrink-0"
          />
          <span className="flex flex-col leading-tight">
            <span
              className={`text-sm font-semibold ${
                overlay ? "" : "text-foreground"
              }`}
            >
              iResource
            </span>
            <span
              className={`text-xs ${overlay ? "text-white/70" : "text-muted"}`}
            >
              MEHRD
            </span>
          </span>
        </Link>

        {!overlay && (
          <form
            action="/search"
            role="search"
            className="hidden max-w-md flex-1 md:block"
          >
            <label htmlFor="header-search" className="sr-only">
              Search the resource hub
            </label>
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                id="header-search"
                type="search"
                name="q"
                placeholder="Search documents, reports, videos…"
                className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </form>
        )}

        <nav className="hidden items-center gap-7 text-base font-medium md:flex">
          {primaryNav.map((item) => (
            <Link key={item.href} href={item.href} className={linkCls}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
