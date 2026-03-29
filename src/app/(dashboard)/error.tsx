"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="mx-auto max-w-lg text-center space-y-6">
        <p className="font-mono text-5xl font-bold">Error</p>
        <h1 className="font-sans text-2xl font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground">
          We couldn&apos;t load this page. Please try again.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <Button variant="default" size="lg" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
