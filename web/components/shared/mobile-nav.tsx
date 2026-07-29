"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  isNavDropdown,
  isNavGroup,
  isNavLink,
  type NavItem,
  type NavLink,
} from "@/lib/nav";

/**
 * Full-page nav takeover for narrow viewports — the header's own `<nav>` is
 * `hidden md:flex`, so this is the only way into primary nav (and search)
 * below the md breakpoint. Trigger color adapts to the header's overlay
 * (transparent-over-hero) vs solid variant, same as the desktop nav links.
 *
 * Nested items (dropdowns and groups) render as an inline sub-heading with
 * their links listed underneath — no additional collapse layer.
 */
export default function MobileNav({
  items,
  variant = "solid",
}: {
  items: NavItem[];
  variant?: "overlay" | "solid";
}) {
  const [open, setOpen] = useState(false);
  const overlay = variant === "overlay";
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "md:hidden",
              overlay
                ? "text-white hover:bg-white/10"
                : "text-muted hover:bg-surface-2 hover:text-foreground",
            )}
          />
        }
      >
        <Icon name="menu" className="size-7" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>

      <SheetContent side="full" className="gap-0 overflow-hidden p-0">
        <SheetTitle className="sr-only">Site navigation</SheetTitle>

        {/* traditional roundel — tucked into the corner so only its
            top-left quarter shows, the rest bleeding off the bottom and
            right edges of the sheet */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-80 -right-80 h-[640px] w-[640px] bg-[url('/circle-traditional-design.jpeg')] bg-contain bg-no-repeat opacity-[0.07]"
        />

        {/* search first — top of the page so the keyboard never covers it */}
        <div className="px-6 pb-2 pt-20">
          <form action="/search" role="search" onSubmit={close}>
            <label htmlFor="mobile-nav-search" className="sr-only">
              Search the Education Resource Hub
            </label>
            <div className="relative">
              <Icon
                name="search"
                className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
              />
              <input
                id="mobile-nav-search"
                type="search"
                name="q"
                enterKeyHint="search"
                placeholder="Search documents, reports, videos…"
                className="h-13 w-full rounded-xl border border-border bg-surface pl-12 pr-4 text-base text-foreground placeholder:text-muted/60 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </form>
        </div>

        <nav className="flex flex-col px-6 pt-4">
          {items.map((item) => renderItem(item, close))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function renderTopLink(link: NavLink, onNavigate: () => void) {
  const commonCls =
    "border-b border-border py-4 text-lg font-medium text-foreground transition-colors last:border-0 hover:text-primary";
  return link.external ? (
    <a
      key={link.key}
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      className={commonCls}
    >
      {link.title}
    </a>
  ) : (
    <Link
      key={link.key}
      href={link.href}
      onClick={onNavigate}
      className={commonCls}
    >
      {link.title}
    </Link>
  );
}

function renderSubLink(link: NavLink, onNavigate: () => void) {
  const commonCls =
    "block py-2 text-base text-foreground/90 transition-colors hover:text-primary";
  return link.external ? (
    <a
      key={link.key}
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      className={commonCls}
    >
      {link.title}
    </a>
  ) : (
    <Link
      key={link.key}
      href={link.href}
      onClick={onNavigate}
      className={commonCls}
    >
      {link.title}
    </Link>
  );
}

function renderItem(item: NavItem, onNavigate: () => void) {
  if (isNavLink(item)) return renderTopLink(item, onNavigate);

  if (isNavGroup(item)) {
    return (
      <div
        key={item.key}
        className="border-b border-border py-4 last:border-0"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {item.title}
        </p>
        <div className="mt-1">
          {item.links.map((l) => renderSubLink(l, onNavigate))}
        </div>
      </div>
    );
  }

  if (isNavDropdown(item)) {
    return (
      <div
        key={item.key}
        className="border-b border-border py-4 last:border-0"
      >
        {item.href ? (
          <Link
            href={item.href}
            onClick={onNavigate}
            className="text-lg font-medium text-foreground hover:text-primary"
          >
            {item.title}
          </Link>
        ) : (
          <p className="text-lg font-medium text-foreground">{item.title}</p>
        )}
        <div className="mt-1">
          {item.items.map((sub) =>
            isNavGroup(sub) ? (
              <div key={sub.key} className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {sub.title}
                </p>
                <div className="mt-1">
                  {sub.links.map((l) => renderSubLink(l, onNavigate))}
                </div>
              </div>
            ) : (
              renderSubLink(sub, onNavigate)
            ),
          )}
        </div>
      </div>
    );
  }

  return null;
}
