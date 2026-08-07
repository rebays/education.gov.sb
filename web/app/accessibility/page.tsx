import type { Metadata } from "next";
import { cmsFetch } from "@/lib/cms";
import AccessibilityPage from "@/components/pages/AccessibilityPage/AccessibilityPage";
import {
  ACCESSIBILITY_URL_PATH,
  GET_ACCESSIBILITY_PAGE,
  type GetAccessibilityPageResult,
} from "@/components/pages/AccessibilityPage/queries";

// This route has no dynamic segment, so Next.js would otherwise try to
// statically prerender it at build time — requiring a live CMS connection
// during build. It's CMS-backed content that changes without a redeploy, so
// render it per-request instead.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "The Ministry of Education and Human Resources Development's commitment to making education.gov.sb usable by everyone.",
};

// Shown until an editor creates the Accessibility page in Wagtail admin.
const fallback = {
  title: "Accessibility",
  lead: "Our commitment to making education.gov.sb usable by everyone, on any device and with any assistive technology.",
  atAGlance: [
    {
      id: "fallback-1",
      blockType: "CharBlock" as const,
      value:
        "Built to WCAG 2.1 Level AA, the standard used across Solomon Islands Government digital services.",
    },
    {
      id: "fallback-2",
      blockType: "CharBlock" as const,
      value:
        "Fully operable by keyboard, including an on-screen shortcuts menu for common actions.",
    },
    {
      id: "fallback-3",
      blockType: "CharBlock" as const,
      value: "Works with screen readers such as NVDA, JAWS, and VoiceOver.",
    },
    {
      id: "fallback-4",
      blockType: "CharBlock" as const,
      value:
        "Designed for low-bandwidth connections, with lightweight pages and offline-friendly assets.",
    },
  ],
  body: `
    <h2>Our commitment</h2>
    <p>The Ministry of Education and Human Resources Development (MEHRD) is committed to ensuring education.gov.sb is accessible to the widest possible audience, including teachers, students, parents, and members of the public with visual, auditory, motor, or cognitive disabilities.</p>
    <p>Accessibility is treated as an ongoing responsibility rather than a one-time fix. We test new features against these standards before they are published, and we welcome reports of anything we've missed.</p>
    <h2>Standards we follow</h2>
    <p>This site is built to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. In practice, this means semantic HTML and landmarks, labelled form controls, sufficient colour contrast, text that can be resized without loss of content, and a visible focus state on every interactive element.</p>
    <h2>Built-in accessibility features</h2>
    <p>A shortcuts menu is available in the bottom-right corner of every page — open it to see the keyboard shortcuts available on that screen, such as S to jump to search or M to open a filter. It is hidden on small touch screens, where keyboard shortcuts don't apply.</p>
    <p>Pages are built with a mobile-first, responsive layout, and images that carry meaning include descriptive alternative text. Where the interface uses colour to convey a state, it is paired with a text label or icon so the information isn't colour-dependent alone.</p>
    <h2>Known limitations</h2>
    <p>Some documents published before this hub launched have not yet been re-tagged for screen readers, and a portion of the video library does not yet carry captions in all languages spoken in the Solomon Islands. We are working through a remediation plan to bring older material up to the same standard as new uploads.</p>
    <h2>Compatible technology</h2>
    <p>education.gov.sb is tested with recent versions of Chrome, Safari, Firefox, and Edge, on both desktop and mobile, and with the NVDA, JAWS, and VoiceOver screen readers. It should also work with older browsers, though some visual polish may be reduced.</p>
    <h2>Feedback</h2>
    <p>If you find a page or document that is difficult to use with assistive technology, please tell us — include the page URL and, if possible, the assistive technology and browser you were using. We aim to acknowledge accessibility reports within five working days.</p>
  `,
  conformanceTarget: "WCAG 2.1 AA",
  effectiveDate: "2026-06-01",
  lastReviewed: "2026-06-01",
  contactEmail: "accessibility@education.gov.sb",
};

export default async function Accessibility() {
  const data = await cmsFetch<GetAccessibilityPageResult>(GET_ACCESSIBILITY_PAGE, {
    urlPath: ACCESSIBILITY_URL_PATH,
  });

  return <AccessibilityPage page={data.page ?? fallback} />;
}
