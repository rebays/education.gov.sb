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
    ? "hover:text-accent"
    : "text-muted hover:text-primary";

  return (
    <header
      className={
        overlay
          ? "relative"
          : "sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur"
      }
    >
      <div className="mx-auto flex w-full max-w-8xl items-center justify-between gap-4 px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/coa-si.webp"
            alt="Solomon Islands coat of arms"
            width={48}
            height={48}
            className="h-12 w-auto shrink-0"
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
              Ministry of Education &amp; Human Resources Development
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
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
