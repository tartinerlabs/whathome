import type { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a WhatHome account to save projects and searches.",
};

export default function SignupPage() {
  return (
    <div className="border-2 border-foreground p-8 shadow-[4px_4px_0px_0px_var(--foreground)]">
      <h1 className="font-sans text-2xl font-bold tracking-tight">
        Create Account
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Join WhatHome to save projects and track your research.
      </p>

      <form className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="uppercase font-bold tracking-wide text-[10px]"
          >
            Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            className="border-2 border-foreground rounded-none"
          />
        </div>

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
          Create Account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-semibold underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Log in
        </a>
      </p>
    </div>
  );
}
