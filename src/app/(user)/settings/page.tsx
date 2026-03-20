import type { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your WhatHome account settings.",
};

export default function SettingsPage() {
  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl max-w-lg space-y-8">
        <h1 className="font-sans text-2xl font-bold tracking-tight">
          Account Settings
        </h1>

        <form className="space-y-6">
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
              disabled
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
              disabled
            />
          </div>

          <button
            type="submit"
            disabled
            className="bg-foreground text-background px-6 py-3 border-2 border-foreground rounded-none font-bold uppercase tracking-wide text-sm opacity-50 cursor-not-allowed"
          >
            Save Changes
          </button>

          <p className="font-mono text-xs text-muted-foreground">
            Account settings will be available once authentication is
            configured.
          </p>
        </form>
      </div>
    </section>
  );
}
