import type { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your WhatHome account settings.",
};

export default function SettingsPage() {
  return (
    <div className="max-w-lg space-y-8">
      <h1 className="font-sans text-2xl font-bold tracking-tight">
        Account Settings
      </h1>

      <form className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-[10px] font-bold uppercase tracking-wide"
          >
            Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            className="rounded-none border-2 border-foreground"
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-[10px] font-bold uppercase tracking-wide"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="rounded-none border-2 border-foreground"
            disabled
          />
        </div>

        <button
          type="submit"
          disabled
          className="cursor-not-allowed rounded-none border-2 border-foreground bg-foreground px-6 py-3 text-sm font-bold uppercase tracking-wide text-background opacity-50"
        >
          Save Changes
        </button>

        <p className="font-mono text-xs text-muted-foreground">
          Account settings will be available once authentication is configured.
        </p>
      </form>
    </div>
  );
}
