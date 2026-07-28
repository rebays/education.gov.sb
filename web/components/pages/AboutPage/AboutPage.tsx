import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import TraditionalWatermark from "@/components/shared/traditional-watermark";
import { MediaAccordion, type MediaAccordionItem } from "@/components/ui/accordion";
import type {
  AboutPage as AboutPageProps,
  ContactFormField as ContactFormFieldType,
} from "./types";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const pillarIcons: Record<string, React.ReactNode> = {
  shield: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden {...stroke}>
      <path d="M12 2 3.5 5.5v6c0 5 3.6 9 8.5 10.5 4.9-1.5 8.5-5.5 8.5-10.5v-6L12 2Z" />
      <path d="m8.5 12 2.5 2.5L16 9.5" />
    </svg>
  ),
  people: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden {...stroke}>
      <path d="M17 11a4 4 0 1 0-4-4" />
      <circle cx="7" cy="8" r="3.2" />
      <path d="M1.5 20c.7-3.3 3.1-5 5.5-5s4.8 1.7 5.5 5" />
      <path d="M14.5 20c.5-2.4 2.2-4 4-4s3.5 1.6 4 4" />
    </svg>
  ),
  cloud: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden {...stroke}>
      <path d="M5 18a5 5 0 0 1 .3-9.9A7 7 0 0 1 19 9.5a4.5 4.5 0 0 1-.5 9H6" />
      <path d="M12 11v6" />
      <path d="m9 14 3 3 3-3" />
    </svg>
  ),
};

const inputClass =
  "h-11 rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary";
const textareaClass =
  "rounded-lg border border-border bg-background px-3.5 py-3 text-sm leading-6 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary";

function ContactFormField({ field }: { field: ContactFormFieldType }) {
  const inputId = `contact-field-${field.id}`;
  const name = inputId;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
        {field.fieldLabel}
      </label>
      {field.blockType === "TextFieldBlock" && (
        <input
          id={inputId}
          name={name}
          type="text"
          placeholder={field.placeholder}
          className={inputClass}
        />
      )}
      {field.blockType === "EmailFieldBlock" && (
        <input
          id={inputId}
          name={name}
          type="email"
          placeholder={field.placeholder}
          className={inputClass}
        />
      )}
      {field.blockType === "MultilineTextFieldBlock" && (
        <textarea
          id={inputId}
          name={name}
          rows={5}
          placeholder={field.placeholder}
          className={textareaClass}
        />
      )}
      {field.blockType === "DropdownFieldBlock" && (
        <select id={inputId} name={name} className={inputClass} defaultValue="">
          <option value="" disabled>
            Select an option
          </option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default function AboutPage(_: { page: AboutPageProps }) {
  const services: MediaAccordionItem[] = _.page.services.map((s) => ({
    title: s.heading,
    description: s.intro,
    image: s.image?.url ?? "",
    imageAlt: s.image?.title,
    tag: s.badge,
    caption: s.text,
  }));

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-about"
        title={_.page.title}
        lead={_.page.lead}
        crumbs={[{ label: _.page.title }]}
      />

      <main className="flex-1 bg-background">
        {/* purpose + pillars */}
        <section className="relative isolate overflow-hidden bg-surface">
          <TraditionalWatermark id="wm-about-purpose" />
          <div className="mx-auto w-full max-w-8xl px-6 py-20 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
              <div>
                <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
                  {_.page.purposeHeading}
                </h2>
                <div
                  className="prose prose-slate mt-5 max-w-none text-muted"
                  dangerouslySetInnerHTML={{ __html: _.page.purposeBody }}
                />
              </div>
              <div className="relative aspect-16/11 overflow-hidden rounded-2xl border border-border shadow-sm">
                <Image
                  src="/sample.png"
                  alt="A classroom in the Solomon Islands"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent" />
              </div>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {_.page.pillars.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col rounded-2xl border border-border bg-background p-7 shadow-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center text-primary">
                    {pillarIcons[p.icon]}
                  </span>
                  <h3 className="mt-5 font-serif text-2xl text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* services */}
        {services.length > 0 && (
          <div className="mx-auto w-full max-w-8xl px-6 py-20 sm:py-24">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
                {_.page.serviceHeading}
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted">
                {_.page.serviceIntro}
              </p>
            </div>

            <MediaAccordion items={services} className="mt-12" />
          </div>
        )}

        {/* get in touch */}
        <section className="bg-surface">
          <div className="mx-auto grid w-full max-w-8xl gap-10 px-6 py-20 sm:py-24 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
                {_.page.supportHeading}
              </h2>
              <p className="mt-4 max-w-md text-base leading-7 text-muted">
                {_.page.supportBody}
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex gap-4 rounded-2xl border border-border bg-background p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden {...stroke}>
                      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
                      <path d="m3 6 9 7 9-7" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Email
                    </p>
                    <a
                      href="mailto:support@education.gov.sb"
                      className="mt-1 block text-sm font-medium text-foreground hover:text-primary"
                    >
                      {_.page.supportEmail}
                    </a>
                  </div>
                </li>
                <li className="flex gap-4 rounded-2xl border border-border bg-background p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden {...stroke}>
                      <circle cx="12" cy="12" r="9.5" />
                      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8v.5" />
                      <path d="M12 17.5h.01" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Help centre
                    </p>
                    <Link
                      href="/about/contact"
                      className="mt-1 block text-sm font-medium text-foreground hover:text-primary"
                    >
                      Visit the support portal
                    </Link>
                  </div>
                </li>
              </ul>
            </div>

            <form className="rounded-3xl border border-border bg-background p-7 shadow-sm sm:p-8">
              <h3 className="font-serif text-2xl text-foreground">
                {_.page.contactFormHeading}
              </h3>
              {_.page.contactFormIntro && (
                <p className="mt-2 text-sm leading-6 text-muted">
                  {_.page.contactFormIntro}
                </p>
              )}

              <div className="mt-7 space-y-5">
                {_.page.contactFormFields.map((field) => (
                  <ContactFormField key={field.id} field={field} />
                ))}
              </div>

              <button
                type="submit"
                className="mt-7 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {_.page.contactFormSubmitText}
              </button>
             
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
