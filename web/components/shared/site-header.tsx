import Image from "next/image";
import Link from "next/link";
import MobileNav from "./mobile-nav";
import HeaderSearch from "./header-search";
import NavDropdown from "./nav-dropdown";
import { getMenu } from "@/lib/menu";
import {
  FALLBACK_MAIN_NAV,
  isNavDropdown,
  isNavGroup,
  isNavLink,
  type NavItem,
} from "@/lib/nav";

/**
 * Shared site header.
 *
 * `variant="overlay"` — transparent, white text; for pages with a full-bleed
 * hero behind the header (the landing page).
 * `variant="solid"` — opaque background with a hairline border; sticky, for
 * all inner pages.
 *
 * Nav items come from the CMS (`main-nav` menu). If the fetch fails, the
 * FALLBACK_MAIN_NAV keeps the site navigable. A top-level LinksGroupBlock is
 * rendered as a dropdown whose title is non-clickable (a group has no page).
 */

export default async function SiteHeader({
  variant = "solid",
}: {
  variant?: "overlay" | "solid";
}) {
  const overlay = variant === "overlay";
  const items = (await getMenu("main-nav")) ?? FALLBACK_MAIN_NAV;

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
          {items.map((item) => renderTopLevel(item, linkCls))}
        </nav>

        <MobileNav items={items} variant={variant} />
      </div>
    </header>
  );
}

function renderTopLevel(item: NavItem, linkCls: string) {
  if (isNavLink(item)) {
    return item.external ? (
      <a
        key={item.key}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkCls}
      >
        {item.title}
      </a>
    ) : (
      <Link key={item.key} href={item.href} className={linkCls}>
        {item.title}
      </Link>
    );
  }

  if (isNavGroup(item)) {
    /* Groups at top level render as a non-clickable dropdown of their links. */
    return (
      <NavDropdown
        key={item.key}
        title={item.title}
        items={item.links}
        triggerClassName={linkCls}
      />
    );
  }

  if (isNavDropdown(item)) {
    return (
      <NavDropdown
        key={item.key}
        title={item.title}
        href={item.href}
        items={item.items}
        triggerClassName={linkCls}
      />
    );
  }

  return null;
}
