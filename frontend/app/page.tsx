import Image from "next/image";
import Link from "next/link";
import NewsBanner from "./components/news-banner";
import Publications from "./components/publications";
import SiteFooter from "./components/site-footer";
import SiteHeader from "./components/site-header";
import TraditionalWatermark from "./components/traditional-watermark";
import { categories } from "./lib/content";
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
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_100%,#1e355f_0%,var(--deep)_60%)]" />

        {/* transparent header over hero */}
        <SiteHeader variant="overlay" />

        {/* hero content — centred, search-first, lifted above optical centre */}
        <div className="relative flex flex-1 items-center">
          <div className="mx-auto w-full max-w-6xl px-6 pb-36 pt-12 text-center">
            <h1 className="font-serif text-5xl leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              iResource
            </h1>
            <p className="mt-2 text-lg leading-8 text-white/80 sm:text-xl">
              Building a brighter future through learning.
            </p>

            <form
              action="/search"
              role="search"
              className="relative mx-auto mt-10 w-full max-w-4xl"
            >
              <input
                type="search"
                name="q"
                placeholder="Search documents, reports, videos…"
                aria-label="Search the resource hub"
                className="h-14 w-full rounded-full border border-white/20 bg-white/95 pl-6 pr-28 text-base text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 h-11 -translate-y-1/2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]"
              >
                Search
              </button>
            </form>

            {/* glass subject pills — suggested searches */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              {heroSubjects.map((s) => (
                <Link
                  key={s.id}
                  href={`/search?q=${encodeURIComponent(s.name)}`}
                  className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md transition-colors hover:border-white/40 hover:bg-white/20 hover:text-white"
                >
                  {s.name}
                </Link>
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
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/resources/${c.slug}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border shadow-sm transition-all hover:-translate-y-1.5 hover:border-accent hover:shadow-xl sm:aspect-[4/5]"
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                {/* brand-blue scrim — solid title zone, fully clear by the card's midpoint */}
                <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--deep)_0%,var(--deep)_10%,rgba(13,31,60,0.92)_17%,rgba(13,31,60,0.78)_24%,rgba(13,31,60,0.6)_31%,rgba(13,31,60,0.4)_38%,rgba(13,31,60,0.2)_44%,rgba(13,31,60,0)_50%)]" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-serif text-2xl leading-snug text-white transition-colors group-hover:text-accent">
                    {c.title}
                  </h3>
                  <span className="mt-1.5 inline-flex items-center gap-2 text-sm font-medium text-white/90 underline decoration-white/40 underline-offset-4 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
                    Browse
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </Link>
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

      {/* ---------- NEWS (slim banner) ---------- */}
      <section className="bg-background">
        <NewsBanner />
      </section>

      {/* ---------- FOOTER ---------- */}
      <SiteFooter />

    </div>
  );
}
