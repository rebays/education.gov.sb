"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ShortcutEntry = { id: string; keys: string; description: string };

type ShortcutsContextValue = {
  entries: ShortcutEntry[];
  register: (entry: ShortcutEntry) => void;
  unregister: (id: string) => void;
};

const ShortcutsContext = createContext<ShortcutsContextValue | null>(null);

/**
 * Tracks which keyboard shortcuts are currently mounted on the page, so the
 * accessibility menu can list exactly what's available right now rather than
 * a hardcoded, page-agnostic list.
 */
export function ShortcutsProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ShortcutEntry[]>([]);

  const register = useCallback((entry: ShortcutEntry) => {
    setEntries((prev) =>
      prev.some((e) => e.id === entry.id) ? prev : [...prev, entry]
    );
  }, []);

  const unregister = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const value = useMemo(
    () => ({ entries, register, unregister }),
    [entries, register, unregister]
  );

  return (
    <ShortcutsContext.Provider value={value}>
      {children}
    </ShortcutsContext.Provider>
  );
}

function useShortcutsContext() {
  const ctx = useContext(ShortcutsContext);
  if (!ctx) {
    throw new Error("Shortcuts hooks must be used within a ShortcutsProvider");
  }
  return ctx;
}

/**
 * Registers a shortcut for as long as the calling component stays mounted —
 * pair with the effect that actually implements the key handling.
 */
export function useShortcutEntry(keys: string, description: string) {
  const { register, unregister } = useShortcutsContext();
  const id = useId();

  useEffect(() => {
    register({ id, keys, description });
    return () => unregister(id);
  }, [id, keys, description, register, unregister]);
}

/**
 * Currently-mounted shortcuts, deduplicated by key + description — several
 * components (e.g. the hero and header search bars) can register the same
 * shortcut on the same page.
 */
export function usePageShortcuts(): ShortcutEntry[] {
  const { entries } = useShortcutsContext();
  const seen = new Set<string>();
  return entries.filter((e) => {
    const key = `${e.keys}|${e.description}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
