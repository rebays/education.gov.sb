"use client";

import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { isNavGroup, type NavGroup, type NavLink } from "@/lib/nav";

/**
 * Desktop navbar dropdown. The trigger is either a plain button (if the CMS
 * dropdown has no page attached) or a link (if it does — clicking the title
 * navigates, hovering opens the panel). Items inside can be a flat NavLink
 * or a NavGroup (title + list of links) — same panel handles both.
 */
export default function NavDropdown({
  title,
  href,
  items,
  triggerClassName,
}: {
  title: string;
  href?: string;
  items: Array<NavLink | NavGroup>;
  triggerClassName?: string;
}) {
  const triggerContent = (
    <>
      {title}
      <Icon name="chevron" className="size-4 rotate-90 opacity-70" />
    </>
  );

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          href ? (
            <Link
              href={href}
              className={cn(
                "inline-flex items-center gap-1 outline-none",
                triggerClassName,
              )}
            />
          ) : (
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1 outline-none",
                triggerClassName,
              )}
            />
          )
        }
      >
        {triggerContent}
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner sideOffset={8}>
          <Menu.Popup className="min-w-56 rounded-xl border border-border bg-background p-2 shadow-lg">
            {items.map((sub) =>
              isNavGroup(sub) ? (
                <Menu.Group key={sub.key}>
                  <Menu.GroupLabel className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    {sub.title}
                  </Menu.GroupLabel>
                  {sub.links.map((link) => (
                    <Menu.LinkItem
                      key={link.key}
                      render={
                        link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ) : (
                          <Link href={link.href} />
                        )
                      }
                      className="block rounded-md px-3 py-2 text-sm text-foreground outline-none hover:bg-surface data-[highlighted]:bg-surface"
                    >
                      {link.title}
                    </Menu.LinkItem>
                  ))}
                </Menu.Group>
              ) : (
                <Menu.LinkItem
                  key={sub.key}
                  render={
                    sub.external ? (
                      <a
                        href={sub.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ) : (
                      <Link href={sub.href} />
                    )
                  }
                  className="block rounded-md px-3 py-2 text-sm text-foreground outline-none hover:bg-surface data-[highlighted]:bg-surface"
                >
                  {sub.title}
                </Menu.LinkItem>
              ),
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
