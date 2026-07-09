"use client";

import { useState } from "react";

/**
 * Live demo of the accordion pattern from the About page's services section:
 * hairline-ruled rows, serif titles, a rotating chevron, and a smooth
 * grid-rows height animation. One panel is always open (selection, not
 * toggle) — on the About page the open row also drives a companion image.
 */
const items = [
  {
    title: "School registration & approvals",
    body: "Register a new school, renew approvals, and meet national operating requirements.",
  },
  {
    title: "Examinations & results",
    body: "Find exam timetables, sit national assessments, and access your results online.",
  },
  {
    title: "Teacher services & payroll",
    body: "Manage teacher registration, professional development, and payroll enquiries.",
  },
];

export default function AccordionDemo() {
  const [active, setActive] = useState(0);

  return (
    <ul className="border-t border-border">
      {items.map((item, i) => {
        const isActive = i === active;
        const panelId = `ds-accordion-panel-${i}`;
        return (
          <li key={item.title} className="border-b border-border">
            <h4>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={isActive}
                aria-controls={panelId}
                className="group flex w-full items-center gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span
                  className={`flex-1 font-serif text-xl transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-foreground group-hover:text-primary"
                  }`}
                >
                  {item.title}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                    isActive ? "rotate-180 text-primary" : "text-muted"
                  }`}
                  aria-hidden
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </h4>
            <div
              id={panelId}
              className={`grid transition-all duration-300 ease-out ${
                isActive
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-md pb-6 text-base leading-7 text-muted">
                  {item.body}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
