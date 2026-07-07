"use client";

import React, { useEffect, useState } from "react";

/**
 * Category panel layout for the design-system page: a sticky left rail of
 * categories; clicking one shows only that category's content, so the page
 * scroll never spans more than the active category. Panels arrive as
 * server-rendered children (one per tab, same order as `tabs`); this
 * component only toggles visibility. The active tab syncs to the URL hash,
 * so #components-style deep links keep working.
 */
export default function CategoryTabs({
  tabs,
  children,
}: {
  tabs: ReadonlyArray<readonly [string, string]>;
  children: React.ReactNode;
}) {
  const [active, setActive] = useState<string>(tabs[0]?.[0] ?? "");
  const panels = React.Children.toArray(children);

  /* honour a deep link like /design-system#components */
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && tabs.some(([id]) => id === hash)) setActive(hash);
  }, [tabs]);

  function choose(id: string) {
    setActive(id);
    history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="mx-auto w-full max-w-8xl flex-1 px-6">
      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-14">
        {/* category rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Categories
            </p>
            <ul className="mt-4 space-y-1 border-l border-border">
              {tabs.map(([id, label]) => {
                const isActive = active === id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => choose(id)}
                      aria-current={isActive ? "true" : undefined}
                      className={`-ml-px block w-full border-l-2 py-1.5 pl-4 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isActive
                          ? "border-primary font-semibold text-primary"
                          : "border-transparent text-muted hover:border-border hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* active category content */}
        <div className="min-w-0">
          {/* mobile category pills */}
          <div className="flex gap-2 overflow-x-auto py-4 lg:hidden">
            {tabs.map(([id, label]) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => choose(id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-foreground hover:bg-surface-2"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {panels.map((panel, i) => {
            const id = tabs[i]?.[0];
            return (
              <div key={id ?? i} hidden={id !== active}>
                {panel}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
