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

export type MobileNavItem = { label: string; href: string };

/**
 * Full-page nav takeover for narrow viewports — the header's own `<nav>` is
 * `hidden md:flex`, so this is the only way into primary nav (and search)
 * below the md breakpoint. Trigger color adapts to the header's overlay
 * (transparent-over-hero) vs solid variant, same as the desktop nav links.
 */
export default function MobileNav({
  items,
  variant = "solid",
}: {
  items: MobileNavItem[];
  variant?: "overlay" | "solid";
}) {
  const [open, setOpen] = useState(false);
  const overlay = variant === "overlay";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "md:hidden",
              overlay ? "text-white hover:bg-white/10" : "text-muted hover:bg-surface-2 hover:text-foreground"
            )}
          />
        }
      >
        <Icon name="menu" className="size-7" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>

      <SheetContent side="full" className="gap-0 p-0">
        <SheetTitle className="sr-only">Site navigation</SheetTitle>

        {/* search first — top of the page so the keyboard never covers it */}
        <div className="px-6 pb-2 pt-20">
          <form action="/search" role="search" onSubmit={() => setOpen(false)}>
            <label htmlFor="mobile-nav-search" className="sr-only">
              Search the resource hub
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
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-border py-4 text-lg font-medium text-foreground transition-colors last:border-0 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
