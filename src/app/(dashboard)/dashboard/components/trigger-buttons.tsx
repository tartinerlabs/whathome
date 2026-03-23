"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

interface TriggerButtonProps {
  endpoint: string;
  label: string;
  body?: Record<string, unknown>;
}

export function TriggerButton({ endpoint, label, body }: TriggerButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleTrigger() {
    startTransition(async () => {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      router.refresh();
    });
  }

  return (
    <Button onClick={handleTrigger} disabled={isPending} size="sm">
      {isPending ? "Starting\u2026" : label}
    </Button>
  );
}
