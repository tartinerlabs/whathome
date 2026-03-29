import { Skeleton } from "@/components/ui/skeleton";

export default function BedroomAnalyticsLoading() {
  return (
    <>
      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[350px] w-full" />
        </div>
      </section>

      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </section>

      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-[350px] w-full" />
        </div>
      </section>
    </>
  );
}
