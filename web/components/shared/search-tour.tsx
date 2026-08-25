"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "iresource:hero-search-tour:v1";
const SPOTLIGHT_PAD = 8;
const CALLOUT_GAP = 16;
const VIEWPORT_PAD = 16;
/* Estimated callout height, used only to decide whether it flips above the
 * spotlight — the card's real height varies a few px with text wrap, which
 * doesn't need to be pixel-exact for that decision. */
const CALLOUT_HEIGHT_ESTIMATE = 208;

type Step = { target: string; title: string; body: string };

/* Points at the live `data-tour` targets rendered by HeroSearch (scope="resources"). */
const STEPS: Step[] = [
  {
    target: "search-tour-query",
    title: "1. Start typing",
    body: "Search across syllabuses, teacher guides, videos etc. Matching results appear right away — no need to press Enter.",
  },
  {
    target: "search-tour-level",
    title: "2. Narrow by curriculum level",
    body: "Pick a level, from Early Childhood to Tertiary, to keep results focused on the right stage of schooling.",
  },
  {
    target: "search-tour-submit",
    title: "3. Search, or pick a result",
    body: "Click a suggestion to jump straight there, or press search to see everything that matches.",
  },
];

function isVisible(el: Element | null): el is HTMLElement {
  return !!el && el instanceof HTMLElement && el.offsetParent !== null;
}

function readDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true; // storage unavailable — don't force the tour every load
  }
}

function markDismissed() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private browsing / storage disabled — nothing to persist */
  }
}

function rectsEqual(a: DOMRect | null, b: DOMRect) {
  return (
    !!a &&
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height
  );
}

/**
 * First-visit spotlight tour for the homepage hero search bar: three steps,
 * each pointing at a live part of the real search bar (query field,
 * curriculum-level filter, submit button) rather than a generic screenshot.
 * Runs once automatically for new visitors (tracked in localStorage) and is
 * replayable any time via the "How search works" link it renders under the
 * hero search bar.
 */
export default function SearchTour() {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const calloutRef = useRef<HTMLDivElement>(null);
  const focusedStepRef = useRef(-1);

  const close = useCallback((persist: boolean) => {
    setOpen(false);
    setRect(null);
    focusedStepRef.current = -1;
    if (persist) markDismissed();
  }, []);

  // Land on the nearest visible step in `direction` from `from` — the level
  // filter isn't rendered below `sm`, so a tablet/desktop-only step is
  // skipped rather than shown pointing at nothing.
  const advanceToVisible = useCallback(
    (from: number, direction: 1 | -1) => {
      let i = from;
      while (i >= 0 && i < STEPS.length) {
        if (isVisible(document.querySelector(`[data-tour="${STEPS[i].target}"]`))) {
          setStepIndex(i);
          return;
        }
        i += direction;
      }
      close(true);
    },
    [close]
  );

  const start = useCallback(() => {
    setOpen(true);
    advanceToVisible(0, 1);
  }, [advanceToVisible]);

  // Auto-run once for first-time visitors, after the hero has settled.
  useEffect(() => {
    if (readDismissed()) return;
    const timer = setTimeout(start, 700);
    return () => clearTimeout(timer);
  }, [start]);

  // Track the current step's target and keep `rect` in sync with
  // scrolling/resizing while the tour is open.
  useLayoutEffect(() => {
    if (!open) return;
    const el = document.querySelector(`[data-tour="${STEPS[stepIndex].target}"]`);
    if (!(el instanceof HTMLElement)) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });

    let frame = 0;
    const update = () => {
      const next = el.getBoundingClientRect();
      setRect((prev) => (rectsEqual(prev, next) ? prev : next));
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [open, stepIndex]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close(true);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // Move focus to the callout once per step, as soon as it's positioned.
  useEffect(() => {
    if (!open || !rect || focusedStepRef.current === stepIndex) return;
    focusedStepRef.current = stepIndex;
    calloutRef.current?.focus();
  }, [open, stepIndex, rect]);

  const step = STEPS[stepIndex];

  let spotlightStyle: React.CSSProperties | undefined;
  let calloutStyle: React.CSSProperties | undefined;
  if (rect) {
    spotlightStyle = {
      top: rect.top - SPOTLIGHT_PAD,
      left: rect.left - SPOTLIGHT_PAD,
      width: rect.width + SPOTLIGHT_PAD * 2,
      height: rect.height + SPOTLIGHT_PAD * 2,
      boxShadow: "0 0 0 9999px color-mix(in srgb, var(--deep) 70%, transparent)",
    };

    const calloutWidth = Math.min(384, window.innerWidth - VIEWPORT_PAD * 2);
    const spaceBelow = window.innerHeight - (rect.bottom + SPOTLIGHT_PAD);
    const spaceAbove = rect.top - SPOTLIGHT_PAD;
    const placeAbove =
      spaceBelow < CALLOUT_HEIGHT_ESTIMATE + CALLOUT_GAP && spaceAbove > spaceBelow;
    const top = placeAbove
      ? Math.max(
          VIEWPORT_PAD,
          rect.top - SPOTLIGHT_PAD - CALLOUT_GAP - CALLOUT_HEIGHT_ESTIMATE
        )
      : Math.min(
          window.innerHeight - CALLOUT_HEIGHT_ESTIMATE - VIEWPORT_PAD,
          rect.bottom + SPOTLIGHT_PAD + CALLOUT_GAP
        );
    const left = Math.min(
      Math.max(rect.left, VIEWPORT_PAD),
      window.innerWidth - calloutWidth - VIEWPORT_PAD
    );
    calloutStyle = { top, left, width: calloutWidth };
  }

  return (
    <>
      <button
        type="button"
        onClick={start}
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-white/60 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white/90"
      >
        <Icon name="info" className="size-4" />
        How search works
      </button>

      {open &&
        rect &&
        createPortal(
          <div className="fixed inset-0 z-100">
            <div
              aria-hidden
              className="pointer-events-none fixed rounded-2xl ring-2 ring-white/70 transition-all duration-300 ease-out"
              style={spotlightStyle}
            />
            <div
              ref={calloutRef}
              role="dialog"
              aria-label={`Search tour, step ${stepIndex + 1} of ${STEPS.length}`}
              tabIndex={-1}
              className="fixed z-10 rounded-2xl border border-border bg-background p-5 text-left shadow-2xl outline-none transition-all duration-300 ease-out"
              style={calloutStyle}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Step {stepIndex + 1} of {STEPS.length}
              </p>
              <h3 className="mt-2 font-serif text-lg text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted">{step.body}</p>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex gap-1.5" aria-hidden>
                  {STEPS.map((s, i) => (
                    <span
                      key={s.target}
                      className={cn(
                        "size-1.5 rounded-full",
                        i === stepIndex ? "bg-primary" : "bg-border"
                      )}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => close(true)}
                    className="text-sm font-medium text-muted hover:text-foreground"
                  >
                    Skip
                  </button>
                  {stepIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => advanceToVisible(stepIndex - 1, -1)}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      stepIndex === STEPS.length - 1
                        ? close(true)
                        : advanceToVisible(stepIndex + 1, 1)
                    }
                    className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    {stepIndex === STEPS.length - 1 ? "Got it" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
