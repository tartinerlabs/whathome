"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ResearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24 md:px-12">
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
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button variant="default" size="lg" onClick={reset}>
            Try again
          </Button>
          <Button variant="outline" size="lg" render={<Link href="/" />}>
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
