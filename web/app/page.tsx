import Link from "next/link";
import { GlassPill } from "@/components/ui/glass-pill";
import CategoryTile from "@/components/shared/category-tile";
import HeroSearch from "@/components/shared/hero-search";
import NewsBanner from "@/components/shared/news-banner";
import Publications from "@/components/shared/publications";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import TraditionalWatermark from "@/components/shared/traditional-watermark";
import { categories, categoryHref } from "./lib/content";
import { subjects } from "./lib/curriculum";

/* subject suggestion pills under the hero search bar */
const heroSubjectIds = [
  "english",
  "mathematics",
  "science",
  "social-studies",
  "agriculture",
];
const heroSubjects = heroSubjectIds
  .map((id) => subjects.find((s) => s.id === id))
  .filter((s) => s !== undefined);

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* ---------- HERO (full screen) ---------- */}
      <section className="relative isolate flex min-h-svh flex-col overflow-hidden text-white">
        {/*
        <Image
          src="/sample.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 scale-[1.02] object-cover blur-[2px] saturate-75"
        />
        */}
        {/* brand background — lighter deep glow at the bottom fading into deep */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_100%,var(--deep-soft)_0%,var(--deep)_60%)]" />

        {/* Isabel woven-mat pattern — faint, full-bleed, fading toward the
            centre so it reads as texture in the night sky rather than a
            photo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[url('/isabel-mat-crop.png')] bg-cover bg-center bg-no-repeat opacity-[0.05] filter-[invert(1)] mask-[radial-gradient(140%_100%_at_50%_15%,#000_0%,transparent_65%)] [-webkit-mask-image:radial-gradient(140%_100%_at_50%_15%,#000_0%,transparent_65%)]"
        />

        {/* transparent header over hero */}
        <SiteHeader variant="overlay" />

        {/* hero content — centred, search-first, lifted above optical centre */}
        <div className="relative flex flex-1 items-center">
          <div className="mx-auto w-full max-w-6xl px-6 pb-36 pt-12 text-center">
            <h1 className="font-serif text-5xl leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Education Resource Hub
            </h1>
            <p className="mt-2 text-lg leading-8 text-white/80 sm:text-xl">
              Building a brighter future through learning.
            </p>

            <HeroSearch className="mx-auto mt-10 max-w-4xl" />

            {/* glass subject pills — suggested searches */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              {heroSubjects.map((s) => (
                <GlassPill
                  key={s.id}
                  href={`/search?q=${encodeURIComponent(s.name)}`}
                >
                  {s.name}
                </GlassPill>
              ))}
            </div>
          </div>
        </div>

        {/* scroll cue */}
        <div className="relative flex justify-center pb-8">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-white/70 motion-safe:animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
          <span className="sr-only">Scroll to explore</span>
        </div>
      </section>

      {/* ---------- CATEGORIES (full screen) ---------- */}
      <section className="relative isolate flex min-h-screen items-center overflow-hidden bg-background">
        <TraditionalWatermark id="wm-categories" />
        <div className="mx-auto w-full max-w-8xl px-6 py-20">
          <h2 className="max-w-2xl font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            Resources by curriculum level.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            Syllabuses, teacher guides, and classroom materials for every
            stage of schooling.
          </p>
          {/* compact 2x2 tiles — mobile only */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:hidden">
            {categories.map((c) => (
              <CategoryTile
                key={c.slug}
                variant="compact"
                href={categoryHref(c.slug)}
                image={c.image}
                title={c.shortTitle}
              />
            ))}
          </div>

          {/* full editorial cards — tablet and up */}
          <div className="mt-12 hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <CategoryTile
                key={c.slug}
                href={categoryHref(c.slug)}
                image={c.image}
                title={c.title}
              />
            ))}
          </div>

          <div className="mt-16">
            <Link
              href="/resources"
              className="group inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
            >
              Browse all resources
              <span
                className="transition-transform group-hover:translate-x-1"
                aria-hidden
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- LATEST PUBLICATIONS (full screen) ---------- */}
      <section className="flex min-h-screen items-center bg-surface">
        <Publications />
      </section>

      {/* ---------- NEWS (full screen) ---------- */}
      <section className="flex min-h-screen items-center bg-background">
        <NewsBanner />
      </section>

      {/* ---------- FOOTER ---------- */}
      <SiteFooter />

    </div>
  );
}
