import type { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Log in to your WhatHome account to access saved projects and searches.",
};

export default function LoginPage() {
  return (
    <div className="border-2 border-foreground p-8 shadow-[4px_4px_0px_0px_var(--foreground)]">
      <h1 className="font-sans text-2xl font-bold tracking-tight">Log In</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome back to WhatHome.
      </p>

      <form className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="uppercase font-bold tracking-wide text-[10px]"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="border-2 border-foreground rounded-none"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="uppercase font-bold tracking-wide text-[10px]"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="border-2 border-foreground rounded-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-foreground text-background px-6 py-3 border-2 border-foreground rounded-none shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wide text-sm"
        >
          Log In
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&rsquo;t have an account?{" "}
        <a
          href="/signup"
          className="font-semibold underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Sign up
        </a>
      </p>
    </div>
  );
}
