import Link from "next/link";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicationLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      {/* mirrors PageHeader's markup, with the title swapped for a skeleton
          since the real title isn't known until the CMS fetch resolves */}
      <section className="relative isolate flex min-h-[40vh] overflow-hidden bg-deep text-white sm:min-h-[45vh]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[url('/traditional-column-horizontal.jpeg')] bg-cover bg-right bg-no-repeat opacity-[0.14] filter-[invert(1)] mask-[linear-gradient(to_right,transparent_0%,transparent_35%,#000_75%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,transparent_35%,#000_75%)]"
        />
        <div className="relative z-10 mx-auto flex w-full max-w-8xl flex-1">
          <div className="flex w-full flex-col justify-center px-6 py-24 sm:py-28">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                <li>
                  <Link href="/" className="hover:text-accent">
                    Home
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden>/</span>
                  <Link href="/publications" className="hover:text-accent">
                    Publications
                  </Link>
                </li>
              </ol>
            </nav>
            <Skeleton className="h-10 w-full max-w-xl bg-white/15 sm:h-12" />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Skeleton className="h-4 w-24 bg-white/15" />
              <Skeleton className="h-4 w-20 bg-white/15" />
              <Skeleton className="h-4 w-48 bg-white/15" />
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 bg-background">
        <div className="mx-auto grid w-full max-w-8xl gap-10 px-6 py-14 lg:grid-cols-[1fr_320px]">
          {/* record body */}
          <div>
            <div className="max-w-2xl space-y-3 border-l-2 border-accent pl-5">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>

            <div className="mt-8 max-w-2xl rounded-2xl border border-border bg-surface p-6">
              <Skeleton className="h-3 w-24" />
              <div className="mt-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            <div className="mt-8 max-w-2xl space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* record sidebar */}
          <aside className="lg:pt-1">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="mt-6 h-11 w-full rounded-full" />
              <div className="mt-6 space-y-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
