"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type MobileNavItem = { label: string; href: string };

/**
 * Slide-in nav drawer for narrow viewports — the header's own `<nav>` is
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
        <Icon name="menu" className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xs">
        <SheetTitle className="sr-only">Site navigation</SheetTitle>

        <SheetHeader className="flex-row items-center gap-3 border-b border-border p-5">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3">
            <Image
              src="/coa-si.webp"
              alt="Solomon Islands coat of arms"
              width={32}
              height={32}
              className="h-8 w-auto shrink-0"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-foreground">iResource</span>
              <span className="text-xs text-muted">MEHRD</span>
            </span>
          </Link>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-surface-2 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <SheetFooter className="border-t border-border p-5">
          <form action="/search" role="search" onSubmit={() => setOpen(false)}>
            <label htmlFor="mobile-nav-search" className="sr-only">
              Search the resource hub
            </label>
            <div className="relative">
              <Icon
                name="search"
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted"
              />
              <input
                id="mobile-nav-search"
                type="search"
                name="q"
                placeholder="Search documents, reports, videos…"
                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
