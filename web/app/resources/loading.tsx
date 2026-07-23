import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton({ delay }: { delay: number }) {
  return (
    <div className="flex flex-col gap-1" style={{ animationDelay: `${delay}ms` }}>
      <Skeleton className="aspect-2/3 w-full rounded-r-md rounded-l-sm" />
      <Skeleton className="mt-3 h-3 w-2/3" />
      <Skeleton className="mt-1 h-3 w-1/3" />
      <Skeleton className="mt-2 h-5 w-16 rounded-full" />
    </div>
  );
}

export default function ResourcesLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <section className="relative isolate flex min-h-[40vh] overflow-hidden bg-deep text-white sm:min-h-[45vh]">
        <div className="relative z-10 mx-auto flex w-full max-w-8xl flex-1">
          <div className="flex w-full flex-col justify-center px-6 py-24 sm:py-28">
            <Skeleton className="h-3 w-24 bg-white/15" />
            <Skeleton className="mt-6 h-10 w-full max-w-lg bg-white/15" />
            <Skeleton className="mt-5 h-4 w-full max-w-xl bg-white/15" />
            <Skeleton className="mt-2 h-4 w-2/3 max-w-lg bg-white/15" />
          </div>
        </div>
      </section>

      <main className="flex-1 bg-background">
        <div className="mx-auto flex w-full max-w-8xl flex-col gap-8 px-6 py-12 lg:flex-row">
          <aside className="hidden w-full shrink-0 flex-col gap-5 lg:flex lg:w-64">
            <Skeleton className="h-4 w-16" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-1.5 h-10 w-full rounded-lg" />
              </div>
            ))}
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between border-b border-border py-2">
              <Skeleton className="h-8 w-36 rounded-lg" />
              <Skeleton className="h-4 w-44" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <CardSkeleton key={i} delay={Math.min(i, 8) * 40} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
