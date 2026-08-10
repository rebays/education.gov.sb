import PageHeader from "@/components/shared/page-header";
import SiteFooter from "@/components/shared/site-footer";
import SiteHeader from "@/components/shared/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicationsLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-publications"
        title="The Ministry's official record."
        crumbs={[{ label: "Publications" }]}
      >
        <Skeleton className="mt-5 h-6 w-full max-w-2xl bg-white/15" />
      </PageHeader>

      <main className="flex-1 bg-background">
        {/* latest release */}
        <section className="mx-auto w-full max-w-8xl px-6 pt-16">
          <div className="grid gap-10 rounded-3xl border border-border bg-surface p-8 sm:p-10 lg:grid-cols-[1fr_280px] lg:items-center">
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
              <div className="mt-8 flex flex-wrap gap-3">
                <Skeleton className="h-11 w-40 rounded-full" />
                <Skeleton className="h-11 w-48 rounded-full" />
              </div>
            </div>
            <Skeleton className="hidden aspect-[3/4] w-[260px] justify-self-center lg:block" />
          </div>
        </section>

        {/* register */}
        <section className="mx-auto w-full max-w-8xl px-6 py-16">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-10 w-80" />

          <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3 border-b border-border pb-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
            <Skeleton className="ml-auto h-9 w-full rounded-full sm:w-64" />
          </div>

          <div className="mt-10 space-y-16">
            {[0, 1].map((i) => (
              <div key={i} className="grid gap-6 lg:grid-cols-[150px_1fr]">
                <Skeleton className="h-12 w-24" />
                <div className="space-y-6 border-t border-border pt-6">
                  {[0, 1, 2].map((j) => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
