import Link from "next/link";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { Skeleton } from "@/components/ui/skeleton";

// Route-level skeleton for every CMS-resolved page. The page type isn't
// known until the fetch resolves, so this mirrors only what they share:
// PageHeader's markup with the title swapped for a skeleton, then a
// neutral content column.
export default function CmsPageLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

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
                  <Skeleton className="h-3 w-24 bg-white/15" />
                </li>
              </ol>
            </nav>
            <Skeleton className="h-10 w-full max-w-xl bg-white/15 sm:h-12" />
            <Skeleton className="mt-5 h-5 w-full max-w-2xl bg-white/15" />
          </div>
        </div>
      </section>

      <main className="flex-1 bg-background">
        <div className="mx-auto w-full max-w-8xl px-6 py-14">
          <div className="max-w-2xl space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="mt-8 h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
