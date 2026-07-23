import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <section className="relative isolate flex min-h-[40vh] overflow-hidden bg-deep text-white sm:min-h-[45vh]">
        <div className="relative z-10 mx-auto flex w-full max-w-8xl flex-1">
          <div className="flex w-full flex-col justify-center px-6 py-24 sm:py-28">
            <Skeleton className="h-3 w-24 bg-white/15" />
            <Skeleton className="mt-6 h-10 w-full max-w-lg bg-white/15" />
            <Skeleton className="mt-8 h-12 w-full max-w-2xl bg-white/15" />
          </div>
        </div>
      </section>

      <main className="flex-1 bg-background">
        <div className="mx-auto w-full max-w-8xl px-6 py-14">
          <ul className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="py-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-[22px] w-20 rounded-full" />
                  <Skeleton className="h-3 w-52" />
                </div>
                <Skeleton className="mt-3 h-6 w-2/3 max-w-md" />
                <Skeleton className="mt-2.5 h-4 w-full max-w-xl" />
              </li>
            ))}
          </ul>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
