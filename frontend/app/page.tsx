import Image from "next/image";
import Link from "next/link";
import Publications from "./components/publications";
import SiteFooter from "./components/site-footer";
import SiteHeader from "./components/site-header";
import TraditionalWatermark from "./components/traditional-watermark";
import { categories } from "./lib/content";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* ---------- HERO (full screen) ---------- */}
      <section className="relative isolate flex min-h-[100svh] flex-col text-white">
        <Image
          src="/soloclassroom.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        {/* brand overlay for legibility */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top_right,rgba(8,20,40,0.94),rgba(8,20,40,0.72)_45%,rgba(20,82,155,0.5))]" />

        {/* transparent header over hero */}
        <SiteHeader variant="overlay" />

        {/* hero content */}
        <div className="relative flex flex-1 items-center">
          <div className="mx-auto w-full max-w-8xl px-6 py-20">
            <h1 className="max-w-4xl font-serif text-5xl leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Building a brigher future through learning.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85 sm:text-xl">
              The central hub for policies, reports, videos, and learning
              resources from the Ministry of Education and Human Resources
              Development.
            </p>

            <form
              action="/search"
              role="search"
              className="mt-10 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
            >
              <input
                type="search"
                name="q"
                placeholder="Search documents, reports, videos…"
                aria-label="Search the resource hub"
                className="h-14 flex-1 rounded-lg border border-white/20 bg-white/95 px-5 text-base text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="h-14 rounded-lg bg-accent px-8 text-base font-semibold text-accent-foreground transition-transform hover:scale-[1.02]"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* scroll cue */}
        <div className="relative pb-8 text-center text-xs uppercase tracking-[0.3em] text-white/60">
          Scroll to explore
        </div>
      </section>

      {/* ---------- CATEGORIES (full screen) ---------- */}
      <section className="relative isolate flex min-h-screen items-center overflow-hidden bg-background">
        <TraditionalWatermark id="wm-categories" />
        <div className="mx-auto w-full max-w-8xl px-6 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Browse the hub
          </p>
          <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            Find what you need, by category.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/resources/${c.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:-translate-y-1.5 hover:border-primary hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-primary backdrop-blur">
                    {c.count}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-serif text-xl text-foreground group-hover:text-primary">
                    {c.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                    {c.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Browse
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- LATEST PUBLICATIONS (full screen) ---------- */}
      <section className="flex min-h-screen items-center bg-surface">
        <Publications />
      </section>

      {/* ---------- CTA — Scholarships (full screen, image bg) ---------- */}
      <section className="relative isolate flex min-h-screen items-center text-white">
        <Image
          src="/cta-scholarships.jpg"
          alt=""
          fill
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(8,20,40,0.92),rgba(8,20,40,0.55))]" />
        <div className="mx-auto w-full max-w-8xl px-6 py-24">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Scholarships &amp; study awards
          </p>
          <h2 className="max-w-3xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Invest in your future. Apply for a scholarship.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">
            The Ministry supports students across the Solomon Islands with
            scholarships and study awards. Check your eligibility, apply, and
            track your application on the national scholarships platform.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="https://scholarships.education.gov.sb"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center justify-center gap-2 rounded-lg bg-accent px-8 text-base font-semibold text-accent-foreground transition-transform hover:scale-[1.02]"
            >
              Apply for a scholarship
              <span aria-hidden>↗</span>
            </a>
            <Link
              href="/publications"
              className="flex h-14 items-center justify-center rounded-lg border border-white/50 px-8 text-base font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Scholarship guidelines
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <SiteFooter />

    </div>
  );
}
