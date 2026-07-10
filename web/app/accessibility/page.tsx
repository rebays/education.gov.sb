import type { Metadata } from "next";
import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { AtAGlance } from "@/components/ui/at-a-glance";
import { FactSheet } from "@/components/ui/fact-sheet";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "The Ministry of Education and Human Resources Development's commitment to making education.gov.sb usable by everyone.",
};

const atAGlance = [
  "Built to WCAG 2.1 Level AA, the standard used across Solomon Islands Government digital services.",
  "Fully operable by keyboard, including an on-screen shortcuts menu for common actions.",
  "Works with screen readers such as NVDA, JAWS, and VoiceOver.",
  "Designed for low-bandwidth connections, with lightweight pages and offline-friendly assets.",
];

const body: string[] = [
  "## Our commitment",
  "The Ministry of Education and Human Resources Development (MEHRD) is committed to ensuring education.gov.sb is accessible to the widest possible audience, including teachers, students, parents, and members of the public with visual, auditory, motor, or cognitive disabilities.",
  "Accessibility is treated as an ongoing responsibility rather than a one-time fix. We test new features against these standards before they are published, and we welcome reports of anything we've missed.",
  "## Standards we follow",
  "This site is built to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. In practice, this means semantic HTML and landmarks, labelled form controls, sufficient colour contrast, text that can be resized without loss of content, and a visible focus state on every interactive element.",
  "## Built-in accessibility features",
  "A shortcuts menu is available in the bottom-right corner of every page — open it to see the keyboard shortcuts available on that screen, such as S to jump to search or M to open a filter. It is hidden on small touch screens, where keyboard shortcuts don't apply.",
  "Pages are built with a mobile-first, responsive layout, and images that carry meaning include descriptive alternative text. Where the interface uses colour to convey a state, it is paired with a text label or icon so the information isn't colour-dependent alone.",
  "## Known limitations",
  "Some documents published before this hub launched have not yet been re-tagged for screen readers, and a portion of the video library does not yet carry captions in all languages spoken in the Solomon Islands. We are working through a remediation plan to bring older material up to the same standard as new uploads.",
  "## Compatible technology",
  "education.gov.sb is tested with recent versions of Chrome, Safari, Firefox, and Edge, on both desktop and mobile, and with the NVDA, JAWS, and VoiceOver screen readers. It should also work with older browsers, though some visual polish may be reduced.",
  "## Feedback",
  "If you find a page or document that is difficult to use with assistive technology, please tell us — include the page URL and, if possible, the assistive technology and browser you were using. We aim to acknowledge accessibility reports within five working days.",
];

export default function AccessibilityPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        title="Accessibility"
        lead="Our commitment to making education.gov.sb usable by everyone, on any device and with any assistive technology."
        crumbs={[{ label: "Accessibility" }]}
      />

      <main className="flex-1 bg-background">
        <div className="mx-auto grid w-full max-w-8xl gap-10 px-6 py-14 lg:grid-cols-[1fr_320px]">
          <article>
            <AtAGlance points={atAGlance} />

            <div className="mt-8 max-w-2xl space-y-6">
              {body.map((block, i) =>
                block.startsWith("## ") ? (
                  <h2
                    key={i}
                    className="pt-4 font-serif text-2xl tracking-tight text-foreground"
                  >
                    {block.slice(3)}
                  </h2>
                ) : (
                  <p key={i} className="text-base leading-8 text-foreground/90">
                    {block}
                  </p>
                ),
              )}
            </div>
          </article>

          <aside className="lg:pt-1">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <FactSheet
                facts={[
                  ["Conformance target", "WCAG 2.1 AA"],
                  ["Effective date", "1 Jun 2026"],
                  ["Last reviewed", "1 Jun 2026"],
                  ["Contact", "accessibility@education.gov.sb"],
                ]}
              />
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
