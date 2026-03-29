"use client";

import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24 md:px-12">
      <div className="mx-auto max-w-lg text-center space-y-6">
        <p className="font-mono text-7xl font-bold">500</p>
        <h1 className="font-sans text-2xl font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground">
          An unexpected error occurred. Please try again.
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
    </main>
  );
}
