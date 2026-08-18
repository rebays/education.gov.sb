import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { AtAGlance } from "@/components/ui/at-a-glance";
import { FactSheet } from "@/components/ui/fact-sheet";
import type { AccessibilityPage as AccessibilityPageProps } from "./types";
import { accessibilityFallback } from "./fallback";

function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export type AccessibilityPageContent = Pick<
  AccessibilityPageProps,
  | "title"
  | "lead"
  | "atAGlance"
  | "bodyHtml"
  | "conformanceTarget"
  | "effectiveDate"
  | "lastReviewed"
  | "contactEmail"
>;

export default function AccessibilityPage(_: {
  page?: AccessibilityPageContent;
}) {
  const page = _.page ?? accessibilityFallback;
  const points = page.atAGlance.map((p) => p.value);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        title={page.title}
        lead={page.lead}
        crumbs={[{ label: "Accessibility" }]}
      />

      <main className="flex-1 bg-background">
        <div className="mx-auto grid w-full max-w-8xl gap-10 px-6 py-14 lg:grid-cols-[1fr_320px]">
          <article>
            {points.length > 0 && <AtAGlance points={points} />}

            <div
              className="prose prose-slate mt-8 max-w-2xl text-base leading-8 text-foreground/90"
              dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
            />
          </article>

          <aside className="lg:pt-1">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <FactSheet
                facts={[
                  ["Conformance target", page.conformanceTarget],
                  [
                    "Effective date",
                    page.effectiveDate ? formatDisplayDate(page.effectiveDate) : "—",
                  ],
                  [
                    "Last reviewed",
                    page.lastReviewed ? formatDisplayDate(page.lastReviewed) : "—",
                  ],
                  ["Contact", page.contactEmail],
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
