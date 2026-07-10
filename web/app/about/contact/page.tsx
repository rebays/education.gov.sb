import type { Metadata } from "next";
import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import TraditionalWatermark from "@/components/shared/traditional-watermark";
import { TopicSelect } from "@/components/shared/topic-select";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the Ministry of Education and Human Resources Development, Solomon Islands.",
};

const topics = [
  ["general", "General enquiry"],
  ["resource", "A document or resource"],
  ["service", "A ministry service"],
  ["media", "Media enquiry"],
  ["hub", "Problem with the hub"],
] as const;

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const contactCards = [
  {
    label: "Visit",
    lines: ["MEHRD Headquarters", "PO Box G28, Honiara", "Solomon Islands"],
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden {...stroke}>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: "Call",
    lines: ["+677 28803", "Monday–Friday", "8:00 am – 4:30 pm"],
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden {...stroke}>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.4 19.4 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.5 2.9.7a2 2 0 0 1 1.7 2z" />
      </svg>
    ),
  },
  {
    label: "Email",
    lines: ["info@mehrd.gov.sb", "Media enquiries:", "media@mehrd.gov.sb"],
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden {...stroke}>
        <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-contact"
        title="Contact us."
        lead="Questions about a document, a service, or the hub itself — send us a message or reach the right office directly."
        crumbs={[{ label: "About", href: "/about" }, { label: "Contact" }]}
      />

      <main className="relative isolate flex-1 overflow-hidden bg-background">
        <TraditionalWatermark id="wm-contact-body" />
        <div className="mx-auto grid w-full max-w-8xl gap-12 px-6 py-16 lg:grid-cols-[1fr_1.1fr]">
          {/* contact details */}
          <div>
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground">
              Reach the Ministry.
            </h2>
            <p className="mt-3 max-w-md text-base leading-7 text-muted">
              The Resource Hub is maintained by the Ministry&apos;s Media &amp;
              Communications Unit. For matters handled in the provinces,
              contact your provincial education authority first.
            </p>
            <div className="mt-8 space-y-4">
              {contactCards.map((c) => (
                <div
                  key={c.label}
                  className="flex gap-4 rounded-2xl border border-border bg-surface p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {c.icon}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {c.label}
                    </p>
                    {c.lines.map((line) => (
                      <p key={line} className="mt-1 text-sm leading-6 text-foreground">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* message form */}
          <div>
            <form className="rounded-3xl border border-border bg-background p-7 shadow-sm sm:p-8">
              <h2 className="font-serif text-2xl text-foreground">
                Send a message
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                We aim to respond within five working days.
              </p>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="contact-name"
                    className="text-sm font-semibold text-foreground"
                  >
                    Full name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className="h-11 rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="contact-email"
                    className="text-sm font-semibold text-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="h-11 rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-1.5">
                <label
                  htmlFor="contact-topic"
                  className="text-sm font-semibold text-foreground"
                >
                  Topic
                </label>
                <TopicSelect id="contact-topic" defaultValue="general" topics={topics} />
              </div>

              <div className="mt-5 flex flex-col gap-1.5">
                <label
                  htmlFor="contact-message"
                  className="text-sm font-semibold text-foreground"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  className="rounded-lg border border-border bg-background px-3.5 py-3 text-sm leading-6 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="How can we help?"
                />
              </div>

              <button
                type="submit"
                className="mt-7 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Send message
              </button>
              <p className="mt-4 text-xs leading-5 text-muted">
                This form is not yet connected — submissions will be wired to
                the CMS contact workflow.
              </p>
            </form>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
