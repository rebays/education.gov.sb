import Image from "next/image";
import Link from "next/link";
import MobileNav from "./mobile-nav";
import HeaderSearch from "./header-search";

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
            src="/coat-of-arms.png"
            alt="Solomon Islands coat of arms"
            width={48}
            height={48}
            className="h-12 w-auto shrink-0"
          />
          <span
            className={`text-xl font-bold ${
              overlay ? "text-white" : "text-foreground"
            }`}
          >
            MEHRD
          </span>
        </Link>

        {!overlay && <HeaderSearch />}

        <nav className="hidden items-center gap-7 text-base font-medium md:flex">
          {primaryNav.map((item) => (
            <Link key={item.href} href={item.href} className={linkCls}>
              {item.label}
            </Link>
          ))}
        </nav>

        <MobileNav items={primaryNav} variant={variant} />
      </div>
    </header>
  );
}
