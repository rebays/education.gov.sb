"use client";

import { useEffect } from "react";

/** Frames to wait for the scroll position to hold still before acting. */
const STABLE_FRAMES = 2;
/** Ceiling on that wait, so a page that never settles doesn't hang it. */
const MAX_FRAMES = 20;

/**
 * Settles the viewport on a page's content rather than its hero on first
 * load. The title band is 40–45vh, so the resource itself — the preview,
 * the file list, the download — starts below the fold on most screens.
 *
 * Only ever scrolls *down*, and only from above the content: whether the
 * position came from a reload, a restored history entry, or a router
 * transition, a visitor already level with the content is left where they
 * are. That one rule replaces trying to infer intent from the navigation
 * type, which can't see client-side transitions in the first place.
 */
export function ScrollPastHero({ targetId }: { targetId: string }) {
  useEffect(() => {
    // A hash is an explicit destination the visitor asked for.
    if (window.location.hash) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    let cancelled = false;
    let frame = 0;

    const events = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    const teardown = () => {
      for (const event of events) window.removeEventListener(event, cancel);
    };

    function cancel() {
      cancelled = true;
      // Starting an instant scroll in place halts one already in flight,
      // so the visitor takes over mid-animation rather than fighting it.
      window.scrollTo({ top: window.scrollY, behavior: "instant" });
      teardown();
    }

    for (const event of events) {
      window.addEventListener(event, cancel, { passive: true, once: true });
    }

    let elapsed = 0;
    let stable = 0;
    let previousY = -1;

    // The router resets scroll on client-side transitions and the browser
    // restores it on reload — both land after this mounts, so wait for the
    // position to stop moving before reading it.
    const settle = () => {
      if (cancelled) return;

      const currentY = window.scrollY;
      stable = currentY === previousY ? stable + 1 : 0;
      previousY = currentY;
      elapsed += 1;

      if (stable < STABLE_FRAMES && elapsed < MAX_FRAMES) {
        frame = requestAnimationFrame(settle);
        return;
      }

      // Matches the scroll-margin the target carries for the sticky site
      // header, so the comparison uses the same resting place scrollIntoView
      // will pick rather than a second copy of the offset.
      const offset = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const contentTop =
        target.getBoundingClientRect().top + window.scrollY - offset;

      // Already level with the content (or past it) — nothing to do.
      if (currentY >= contentTop - 1) {
        teardown();
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      target.scrollIntoView({
        behavior: prefersReducedMotion ? "instant" : "smooth",
        block: "start",
      });
    };

    frame = requestAnimationFrame(settle);

    return () => {
      cancelAnimationFrame(frame);
      teardown();
    };
  }, [targetId]);

  return null;
}
