"use client";

import { useEffect, type RefObject } from "react";
import { useShortcutEntry } from "../components/shortcuts-provider";

/**
 * Focuses `ref` when the user presses `key` (default "f"), mirroring the
 * single-letter search shortcuts on Gmail/GitHub. Ignored while focus is
 * already inside a form field/contenteditable or a modifier is held, so it
 * doesn't hijack typing elsewhere on the page.
 */
export function useSearchShortcut(
  ref: RefObject<HTMLInputElement | null>,
  key = "f"
) {
  useShortcutEntry(key.toUpperCase(), "Focus search");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== key || e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      e.preventDefault();
      ref.current?.focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [ref, key]);
}
