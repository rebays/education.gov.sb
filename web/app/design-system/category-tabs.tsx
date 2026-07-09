"use client";

import React, { useEffect, useRef, useState } from "react";

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
  /** [id, label, group] — consecutive tabs sharing a group render under one heading */
  tabs: ReadonlyArray<readonly [string, string, string]>;
  children: React.ReactNode;
}) {
  const [active, setActive] = useState<string>(tabs[0]?.[0] ?? "");
  const panels = React.Children.toArray(children);
  const rootRef = useRef<HTMLDivElement>(null);

  /* honour a deep link like /design-system#components */
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && tabs.some(([id]) => id === hash)) setActive(hash);
  }, [tabs]);

  function choose(id: string) {
    setActive(id);
    history.replaceState(null, "", `#${id}`);
    /* land at the start of the content, not the top of the page */
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      ref={rootRef}
      className="mx-auto w-full max-w-8xl flex-1 scroll-mt-20 px-6"
    >
      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-14">
        {/* category rail, grouped */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 py-14">
            {tabs.map(([id, label, group], i) => {
              const isActive = active === id;
              const startsGroup = i === 0 || tabs[i - 1][2] !== group;
              return (
                <div key={id}>
                  {startsGroup && (
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.2em] text-muted ${
                        i === 0 ? "" : "mt-8"
                      }`}
                    >
                      {group}
                    </p>
                  )}
                  <ul
                    className={`border-l border-border ${startsGroup ? "mt-3" : "-mt-px"}`}
                  >
                    <li>
                      <button
                        type="button"
                        onClick={() => choose(id)}
                        aria-current={isActive ? "true" : undefined}
                        className={`-ml-px block w-full cursor-pointer border-l-2 py-1.5 pl-4 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isActive
                            ? "border-primary font-semibold text-primary"
                            : "border-transparent text-muted hover:border-border hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    </li>
                  </ul>
                </div>
              );
            })}
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
                  className={`shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
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
