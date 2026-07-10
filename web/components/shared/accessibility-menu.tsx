"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { usePageShortcuts } from "./shortcuts-provider";

/**
 * Floating bottom-right toggle listing the keyboard shortcuts currently
 * available on the page (driven by `ShortcutsProvider` — components
 * register their own shortcuts, so this stays accurate as pages change).
 */
export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const shortcuts = usePageShortcuts();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="fixed right-6 bottom-6 z-50 hidden sm:block">
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Keyboard shortcuts"
          className="absolute right-0 bottom-full mb-3 w-72 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-2xl backdrop-blur-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70">
            Keyboard shortcuts
          </p>

          {shortcuts.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2.5">
              {shortcuts.map((s) => (
                <li
                  key={`${s.keys}-${s.description}`}
                  className="flex items-center justify-between gap-3 text-sm text-foreground"
                >
                  <span>{s.description}</span>
                  <kbd className="flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-background/80 px-1.5 font-mono text-xs font-medium text-muted">
                    {s.keys}
                  </kbd>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">
              No keyboard shortcuts on this page.
            </p>
          )}
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? "Close keyboard shortcuts menu" : "Show keyboard shortcuts"}
        className={cn(
          "flex size-12 items-center justify-center rounded-full border shadow-lg backdrop-blur-xl transition-colors",
          open
            ? "border-primary/50 bg-primary text-primary-foreground"
            : "border-border/60 bg-background/70 text-foreground hover:border-primary hover:text-primary"
        )}
      >
        <Icon name={open ? "close" : "keyboard"} className="size-5" />
      </button>
    </div>
  );
}
