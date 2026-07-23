import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResourceLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <section className="relative isolate flex min-h-[40vh] overflow-hidden bg-deep text-white sm:min-h-[45vh]">
        <div className="relative z-10 mx-auto flex w-full max-w-8xl flex-1">
          <div className="flex w-full flex-col justify-center px-6 py-24 sm:py-28">
            <Skeleton className="h-3 w-56 bg-white/15" />
            <Skeleton className="mt-6 h-10 w-full max-w-lg bg-white/15" />
            <Skeleton className="mt-5 h-4 w-full max-w-xl bg-white/15" />
            <Skeleton className="mt-2 h-4 w-2/3 max-w-lg bg-white/15" />
          </div>
        </div>
      </section>

      <main className="flex-1 bg-background">
        <div className="mx-auto grid w-full max-w-8xl gap-10 px-6 py-14 lg:grid-cols-[1fr_320px]">
          {/* preview */}
          <Skeleton className="aspect-3/4 w-full max-w-md justify-self-center rounded-2xl sm:aspect-video sm:max-w-none" />

          {/* metadata sidebar */}
          <aside className="lg:pt-1">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <Skeleton className="h-12 w-full rounded-lg" />
              <div className="mt-6 space-y-3.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-baseline justify-between gap-4 border-b border-border/70 pb-3 last:border-0 last:pb-0"
                  >
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </div>
            <Skeleton className="mt-4 h-8 w-full" />
          </aside>
        </div>

        {/* related */}
        <section className="bg-surface">
          <div className="mx-auto w-full max-w-8xl px-6 py-14">
            <Skeleton className="h-8 w-64" />
            <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 sm:px-6">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-5 w-1/2 max-w-xs" />
                    <Skeleton className="mt-2 h-3 w-2/3 max-w-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
