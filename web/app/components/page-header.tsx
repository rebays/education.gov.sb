import Link from "next/link";

export type Crumb = { label: string; href?: string };

/**
 * Deep-blue title band used at the top of every inner page: breadcrumb,
 * serif title, optional lead paragraph and extra content (e.g. a search
 * form) via children. The navy carries the traditional woven-column motif
 * on its right side only, fading out toward the left where the text sits.
 */
export default function PageHeader({
  id,
  title,
  lead,
  crumbs,
  children,
}: {
  /** Unused — kept optional so existing call sites don't need to change. */
  id?: string;
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate flex min-h-[40vh] overflow-hidden bg-deep text-white sm:min-h-[45vh]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/traditional-column-horizontal.jpeg')] bg-cover bg-right bg-no-repeat opacity-[0.14] [filter:invert(1)] [mask-image:linear-gradient(to_right,transparent_0%,transparent_35%,#000_75%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,transparent_35%,#000_75%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-8xl flex-1">
        <div className="flex w-full flex-col justify-center px-6 py-24 sm:py-28">
          {crumbs && crumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                <li>
                  <Link href="/" className="hover:text-accent">
                    Home
                  </Link>
                </li>
                {crumbs.map((c) => (
                  <li key={c.label} className="flex items-center gap-2">
                    <span aria-hidden>/</span>
                    {c.href ? (
                      <Link href={c.href} className="hover:text-accent">
                        {c.label}
                      </Link>
                    ) : (
                      <span className="text-white/85">{c.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <h1 className="max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            {title}
          </h1>
          {lead && (
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
              {lead}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
