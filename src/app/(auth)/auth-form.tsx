"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth-client";

interface AuthFormProps {
  defaultMode?: "login" | "signup";
}

export function AuthForm({ defaultMode = "login" }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState(defaultMode);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (isLogin) {
        const { error } = await signIn.email({
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        });
        if (error) {
          setError(error.message ?? "Login failed");
          return;
        }
      } else {
        const { error } = await signUp.email({
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        });
        if (error) {
          setError(error.message ?? "Sign up failed");
          return;
        }
      }

      router.push("/dashboard");
    });
  }

  function handleGoogleSignIn() {
    startTransition(async () => {
      await signIn.social({ provider: "google", callbackURL: "/dashboard" });
    });
  }

  return (
    <div className="border-2 border-foreground p-8 shadow-[4px_4px_0px_0px_var(--foreground)]">
      <h1 className="font-sans text-2xl font-bold tracking-tight">
        {isLogin ? "Log In" : "Create Account"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isLogin
          ? "Welcome back to WhatHome."
          : "Join WhatHome to save projects and track your research."}
      </p>

      {error && (
        <p className="mt-4 text-sm font-medium text-destructive">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {!isLogin && (
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-[10px] font-bold uppercase tracking-wide"
            >
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              required={!isLogin}
              className="rounded-none border-2 border-foreground"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-[10px] font-bold uppercase tracking-wide"
          >
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="rounded-none border-2 border-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-[10px] font-bold uppercase tracking-wide"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            className="rounded-none border-2 border-foreground"
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? isLogin
              ? "Logging in\u2026"
              : "Creating account\u2026"
            : isLogin
              ? "Log In"
              : "Create Account"}
        </Button>
      </form>

      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={handleGoogleSignIn}
          className="w-full"
        >
          Continue with Google
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isLogin ? "Don\u2019t have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => setMode(isLogin ? "signup" : "login")}
          className="font-semibold underline underline-offset-2 transition-colours hover:text-foreground"
        >
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </p>
    </div>
  );
}
