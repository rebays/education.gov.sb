import type { Metadata } from "next";
import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { FactSheet } from "@/components/ui/fact-sheet";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms that apply when you access and use education.gov.sb and the resources published on it.",
};

const body: string[] = [
  "## Acceptance of these terms",
  "By accessing or using education.gov.sb, you agree to these terms of use. If you do not agree with them, please discontinue use of the site.",
  "## Use of the platform",
  "The hub is provided for educational, informational, and administrative purposes for teachers, students, parents, provincial education authorities, and the general public. You agree not to misuse the platform, interfere with its operation, or attempt to gain unauthorised access to it.",
  "## Curriculum materials and content",
  "Unless a document states otherwise, materials published by MEHRD on this hub may be downloaded, printed, and shared for non-commercial educational use within Solomon Islands schools and communities, provided the Ministry is credited as the source and the content is not altered.",
  "## Intellectual property",
  "The Ministry retains copyright in the design, code, and original content of this hub, and rights in its marks, including the Solomon Islands coat of arms. Material sourced from third parties, such as partner organisations or contributors, remains the property of its respective owners and may carry its own terms.",
  "## Accuracy and availability",
  "We update the hub regularly, but we do not guarantee that every document is complete, current, or free of error, and the site may occasionally be unavailable for maintenance. Where a policy or legal document is concerned, the official gazetted or printed version remains the authoritative one.",
  "## Links to other websites",
  "This hub links to other Government and partner websites for your convenience, including the Ministry's main site and the national scholarships portal. We are not responsible for the content or practices of sites we don't operate.",
  "## Limitation of liability",
  "The hub and the material on it are provided on an \"as is\" basis. To the extent permitted by law, the Ministry is not liable for any loss or damage arising from your use of, or inability to use, education.gov.sb.",
  "## Changes to these terms",
  "These terms may be revised from time to time as the hub evolves. Continued use of the site after a change takes effect means you accept the updated terms.",
  "## Governing law",
  "These terms are governed by the laws of Solomon Islands.",
  "## Contact",
  "Questions about these terms can be sent to legal@mehrd.gov.sb, or through the general enquiry form on the About page.",
];

export default function TermsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        title="Terms of Use"
        lead="The terms that apply when you access and use education.gov.sb and the resources published on it."
        crumbs={[{ label: "Terms of use" }]}
      />

      <main className="flex-1 bg-background">
        <div className="mx-auto grid w-full max-w-8xl gap-10 px-6 py-14 lg:grid-cols-[1fr_320px]">
          <article>
            <div className="max-w-2xl space-y-6">
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
                  ["Effective date", "1 Jun 2026"],
                  ["Last updated", "1 Jun 2026"],
                  ["Governing law", "Solomon Islands"],
                  ["Contact", "legal@mehrd.gov.sb"],
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
