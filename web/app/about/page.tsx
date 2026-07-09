import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "../components/page-header";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";
import TraditionalWatermark from "../components/traditional-watermark";
import AboutServices from "./services-section";
import { TopicSelect } from "../components/topic-select";

export const metadata: Metadata = {
  title: "About",
  description:
    "education.gov.sb is the official digital learning portal of the Solomon Islands — built by MEHRD with UNICEF Pacific support.",
};

const topics = [
  ["general", "General enquiry"],
  ["resource", "A document or resource"],
  ["contribute", "Contributing to education.gov.sb"],
  ["hub", "Problem with the platform"],
] as const;

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const pillars = [
  {
    title: "Verified curriculum",
    text: "Every resource on the platform is carefully vetted by MEHRD subject specialists to ensure 100% alignment with the Solomon Islands National Curriculum.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden {...stroke}>
        <path d="M12 2 3.5 5.5v6c0 5 3.6 9 8.5 10.5 4.9-1.5 8.5-5.5 8.5-10.5v-6L12 2Z" />
        <path d="m8.5 12 2.5 2.5L16 9.5" />
      </svg>
    ),
  },
  {
    title: "Inclusive learning",
    text: "From Early Childhood Education (ECE) to Year 12, we provide materials for all grades, subjects and learning styles, ensuring no student is left behind.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden {...stroke}>
        <path d="M17 11a4 4 0 1 0-4-4" />
        <circle cx="7" cy="8" r="3.2" />
        <path d="M1.5 20c.7-3.3 3.1-5 5.5-5s4.8 1.7 5.5 5" />
        <path d="M14.5 20c.5-2.4 2.2-4 4-4s3.5 1.6 4 4" />
      </svg>
    ),
  },
  {
    title: "Optimised access",
    text: "The platform is engineered for low-bandwidth environments, with small file sizes and offline-first capabilities for remote island communities.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden {...stroke}>
        <path d="M5 18a5 5 0 0 1 .3-9.9A7 7 0 0 1 19 9.5a4.5 4.5 0 0 1-.5 9H6" />
        <path d="M12 11v6" />
        <path d="m9 14 3 3 3-3" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-about"
        title="About education.gov.sb."
        lead="education.gov.sb is the official digital learning portal of the Solomon Islands — built by MEHRD with UNICEF Pacific support."
        crumbs={[{ label: "About" }]}
      />

      <main className="flex-1 bg-background">
        {/* purpose + pillars */}
        <section className="relative isolate overflow-hidden bg-surface">
          <TraditionalWatermark id="wm-about-purpose" />
          <div className="mx-auto w-full max-w-8xl px-6 py-20 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
              <div>
                <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
                  A national portal, built for every learner.
                </h2>
                <p className="mt-5 text-base leading-7 text-muted">
                  education.gov.sb is the official digital learning portal of the
                  Solomon Islands, built to ensure every student has access to
                  high-quality, curriculum-aligned educational materials,
                  regardless of their location or internet connectivity.
                </p>
                <p className="mt-4 text-base leading-7 text-muted">
                  It is a collaborative initiative — with the Ministry of
                  Education and Human Resources Development (MEHRD) as
                  official lead and UNICEF Pacific as global partner — built
                  on three pillars designed to overcome the unique challenges
                  of education in the Pacific.
                </p>
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
              {pillars.map((p) => (
                <div
                  key={p.title}
                  className="flex flex-col rounded-2xl border border-border bg-background p-7 shadow-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center text-primary">
                    {p.icon}
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

        <AboutServices />

        {/* get in touch */}
        <section className="bg-surface">
          <div className="mx-auto grid w-full max-w-8xl gap-10 px-6 py-20 sm:py-24 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <h2 className="font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
                We&apos;re here to help.
              </h2>
              <p className="mt-4 max-w-md text-base leading-7 text-muted">
                Have questions about the platform? Our support team is here to
                help you get the most out of education.gov.sb.
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
                      support@education.gov.sb
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
                Send a message
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                We aim to respond within five working days.
              </p>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="about-contact-name"
                    className="text-sm font-semibold text-foreground"
                  >
                    Full name
                  </label>
                  <input
                    id="about-contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className="h-11 rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="about-contact-email"
                    className="text-sm font-semibold text-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="about-contact-email"
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
                  htmlFor="about-contact-topic"
                  className="text-sm font-semibold text-foreground"
                >
                  Topic
                </label>
                <TopicSelect id="about-contact-topic" defaultValue="general" topics={topics} />
              </div>

              <div className="mt-5 flex flex-col gap-1.5">
                <label
                  htmlFor="about-contact-message"
                  className="text-sm font-semibold text-foreground"
                >
                  Message
                </label>
                <textarea
                  id="about-contact-message"
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
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
