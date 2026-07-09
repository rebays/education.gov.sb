"use client";

import { useEffect } from "react";

/**
 * Runs `onTrigger` when `key` is pressed, ignoring modifier combos and any
 * press while focus is already inside a form field/contenteditable — the
 * guard shared by the site's single-letter shortcuts so typing elsewhere
 * never gets hijacked. Pass `enabled = false` to suspend the listener
 * entirely (e.g. while a control the key would otherwise conflict with is
 * open).
 */
export function useKeyShortcut(
  key: string,
  onTrigger: (e: KeyboardEvent) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== key.toLowerCase() || e.metaKey || e.ctrlKey || e.altKey) {
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

      onTrigger(e);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, onTrigger, enabled]);
}
