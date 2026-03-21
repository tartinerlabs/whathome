import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-24 md:px-12">
        <div className="mx-auto max-w-lg text-center space-y-6">
          <p className="font-mono text-7xl font-bold">404</p>
          <h1 className="font-sans text-2xl font-bold tracking-tight">
            Page not found
          </h1>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button variant="default" size="lg" render={<Link href="/" />}>
              Home
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={<Link href="/projects" />}
            >
              Browse Projects
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
