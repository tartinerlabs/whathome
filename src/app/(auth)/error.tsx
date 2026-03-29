"use client";

import { Button } from "@/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="w-full space-y-6 text-center">
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
  );
}
