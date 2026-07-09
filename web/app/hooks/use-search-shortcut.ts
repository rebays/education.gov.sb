"use client";

import { useCallback, type RefObject } from "react";
import { useShortcutEntry } from "../components/shortcuts-provider";
import { useKeyShortcut } from "./use-key-shortcut";

/**
 * Focuses `ref` when the user presses `key` (default "s"), mirroring the
 * single-letter search shortcuts on Gmail/GitHub. Pass `enabled = false` to
 * suspend it (e.g. while another control on the same bar is claiming that
 * key, such as an open dropdown's typeahead).
 */
export function useSearchShortcut(
  ref: RefObject<HTMLInputElement | null>,
  key = "s",
  enabled = true
) {
  useShortcutEntry(key.toUpperCase(), "Focus search");

  const handleTrigger = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      ref.current?.focus();
    },
    [ref]
  );

  useKeyShortcut(key, handleTrigger, enabled);
}
