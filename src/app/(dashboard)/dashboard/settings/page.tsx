import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your WhatHome account settings.",
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="font-sans text-2xl font-bold tracking-tight">
        Account Settings
      </h1>

      <SettingsForm name={session.user.name} email={session.user.email} />
    </div>
  );
}
