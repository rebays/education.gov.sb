import type { Metadata } from "next";
import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { FactSheet } from "@/components/ui/fact-sheet";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How the Ministry of Education and Human Resources Development collects, uses, and protects information on education.gov.sb.",
};

const body: string[] = [
  "## Information we collect",
  "education.gov.sb does not require an account to browse or download resources, so we do not hold user profiles or passwords. We collect two kinds of information: general usage data (pages visited, browser type, and approximate location inferred from your IP address), and anything you choose to submit through a form on the site, such as your name, email address, and message when you contact us.",
  "## How we use this information",
  "Usage data helps us understand which resources are most useful and where the hub is slow or hard to navigate, so we can prioritise improvements. Information submitted through a contact form is used only to respond to your enquiry and is not added to a mailing list unless you ask us to.",
  "## Cookies and analytics",
  "The hub uses a small number of essential cookies to remember your preferences, such as your selected curriculum level filter. We also use aggregate analytics to see overall traffic patterns; this data is reported in a form that does not identify individual visitors.",
  "## Sharing of information",
  "We do not sell or trade personal information. It may be shared with service providers who help operate the hub — such as SIG ICT Services, which hosts the platform — under obligations to keep it confidential, or where disclosure is required by law.",
  "## Data retention and security",
  "Information is kept only as long as necessary for the purpose it was collected for, then deleted or anonymised. Data in transit to and from the hub is encrypted, and the platform is hosted on Solomon Islands Government ICT Services infrastructure.",
  "## Children's privacy",
  "education.gov.sb is a public information resource intended for use by teachers, students, parents, and the general public. It is not designed to knowingly collect personal information directly from young children, and school-related data about students is managed separately through SIEMIS and provincial education authorities, not through this hub.",
  "## External links",
  "The hub links to other Government and partner sites, including the Ministry's main website and the national scholarships portal. Those sites have their own privacy practices, and this policy does not cover them.",
  "## Your rights",
  "If you have submitted information to us through a contact form, you can ask us to show you what we hold, correct it, or delete it, by getting in touch using the details below.",
  "## Changes to this policy",
  "We may update this policy from time to time as the hub evolves. The date below shows when it was last revised.",
  "## Contact us",
  "Questions about this policy can be sent to privacy@education.gov.sb, or through the general enquiry form on the About page.",
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        title="Privacy Policy"
        lead="How the Ministry collects, uses, and protects information when you use education.gov.sb."
        crumbs={[{ label: "Privacy" }]}
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
                  ["Contact", "privacy@education.gov.sb"],
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
