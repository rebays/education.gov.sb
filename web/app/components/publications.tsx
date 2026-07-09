import Link from "next/link";
import PublicationCover from "./publication-cover";
import { publications, publicationRef } from "../lib/content";

/**
 * Landing-page publications section — an editorial split: heading, blurb,
 * and a quiet register list on the left; the latest covers fanned like
 * documents on a desk on the right. The full record lives on the
 * publications index.
 */
export default function Publications() {
  const recent = publications.slice(0, 4);
  /* fan order: two older covers behind, the latest upright in front */
  const fan = [recent[2], recent[1], recent[0]].filter(Boolean);
  const fanStyle = [
    "-rotate-[9deg] translate-y-4",
    "rotate-[6deg] -ml-24 translate-y-1 sm:-ml-28",
    "-ml-24 sm:-ml-28",
  ];

  return (
    <div className="relative mx-auto grid w-full max-w-8xl items-center gap-16 px-6 py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
      {/* tema silhouette — quiet corner accent, bottom-right of the section */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 hidden h-[448px] w-[448px] rotate-180 bg-[url('/tema.jpeg')] bg-contain bg-bottom-right bg-no-repeat opacity-[0.06] sm:block sm:h-[576px] sm:w-[576px]"
      />

      {/* left — words */}
      <div>
        <h2 className="font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
          Latest publications.
        </h2>
        <p className="mt-5 max-w-md text-lg leading-8 text-muted">
          Policies, reports, and guidelines — every release recorded on the
          Ministry&apos;s official register.
        </p>

        <ul className="mt-10 divide-y divide-border border-y border-border">
          {recent.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/publications/${p.slug}`}
                className="group flex items-baseline gap-5 py-4"
              >
                <span className="w-32 shrink-0 font-mono text-xs text-muted">
                  {publicationRef(p)}
                </span>
                <span className="min-w-0 font-serif text-lg leading-snug text-foreground transition-colors group-hover:text-primary">
                  {p.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/publications"
          className="group mt-12 inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
        >
          Browse the full register
          <span
            className="transition-transform group-hover:translate-x-1"
            aria-hidden
          >
            →
          </span>
        </Link>
      </div>

      {/* right — fanned covers, latest in front. Hidden below `lg`, where
          the grid stacks to one column and this would otherwise sit
          beneath the list as three loose cards. */}
      <div className="hidden items-center justify-center py-10 lg:flex">
        {fan.map((p, i) => (
          <Link
            key={p.slug}
            href={`/publications/${p.slug}`}
            aria-label={p.title}
            className={`relative w-44 shrink-0 transition-all duration-300 hover:z-20 hover:-translate-y-4 hover:rotate-0 sm:w-56 lg:w-64 ${fanStyle[i]}`}
          >
            <PublicationCover publication={p} className="w-full" />
          </Link>
        ))}
      </div>
    </div>
  );
}
