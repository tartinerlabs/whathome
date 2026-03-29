import { Skeleton } from "@/components/ui/skeleton";

function ChartSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className={`h-8 ${titleWidth}`} />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-[350px] w-full" />
      </div>
    </section>
  );
}

export default function AnalyticsLoading() {
  return (
    <>
      <ChartSkeleton titleWidth="w-48" />
      <ChartSkeleton titleWidth="w-56" />
      <ChartSkeleton titleWidth="w-64" />
    </>
  );
}
