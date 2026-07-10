"use client";

import { useRef } from "react";
import { SearchField } from "@/components/ui/search-field";
import { useSearchShortcut } from "@/app/hooks/use-search-shortcut";

/**
 * The inner-page header's search form. Split out from `SiteHeader` so the
 * "f" focus shortcut (client-only) doesn't force the whole header to be a
 * client component.
 */
export default function HeaderSearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  useSearchShortcut(inputRef);

  return (
    <form
      action="/search"
      role="search"
      className="hidden max-w-md flex-1 md:block"
    >
      <label htmlFor="header-search" className="sr-only">
        Search the resource hub
      </label>
      <SearchField
        ref={inputRef}
        id="header-search"
        name="q"
        placeholder="Search documents, reports, videos…"
        shortcutHint
      />
    </form>
  );
}
