import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your WhatHome account settings.",
};

async function SettingsContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return <SettingsForm name={session.user.name} email={session.user.email} />;
}

export default function SettingsPage() {
  return (
    <div className="max-w-lg space-y-8">
      <h1 className="font-sans text-2xl font-bold tracking-tight">
        Account Settings
      </h1>

      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
