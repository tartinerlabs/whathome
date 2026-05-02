"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

interface TriggerButtonProps {
  endpoint: string;
  label: string;
  body?: Record<string, unknown>;
}

interface WorkflowProgressEvent {
  type: string;
  message?: string;
  timestamp?: string;
}

export function TriggerButton({ endpoint, label, body }: TriggerButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<WorkflowProgressEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleTrigger() {
    setError(null);
    setEvents([]);
    setIsRunning(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const { runId } = (await response.json()) as { runId?: string };
      if (!runId) throw new Error("Workflow did not return a runId");

      await readProgressStream(runId);
      startTransition(() => router.refresh());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setIsRunning(false);
    }
  }

  async function readProgressStream(runId: string) {
    const response = await fetch(`/api/workflows/${runId}/stream`);
    if (!response.ok) {
      throw new Error(await response.text());
    }
    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) appendProgressEvent(line);
    }

    buffer += decoder.decode();
    if (buffer.trim()) appendProgressEvent(buffer);
  }

  function appendProgressEvent(line: string) {
    try {
      const event = JSON.parse(line) as WorkflowProgressEvent;
      setEvents((current) => [...current, event].slice(-5));
    } catch {
      setEvents((current) =>
        [...current, { type: "progress", message: line }].slice(-5),
      );
    }
  }

  const latest = events.at(-1);

  return (
    <div className="max-w-72 space-y-2">
      <Button
        onClick={handleTrigger}
        disabled={isRunning || isPending}
        size="sm"
      >
        {isRunning ? "Running..." : isPending ? "Refreshing..." : label}
      </Button>
      {latest?.message ? (
        <p className="font-mono text-[11px] text-muted-foreground">
          {latest.message}
        </p>
      ) : null}
      {events.length > 1 ? (
        <div className="space-y-1 border-l border-border pl-2">
          {events.slice(0, -1).map((event) => (
            <p
              key={`${event.timestamp ?? "event"}-${event.message ?? event.type}`}
              className="truncate font-mono text-[10px] text-muted-foreground/70"
            >
              {event.message ?? event.type}
            </p>
          ))}
        </div>
      ) : null}
      {error ? (
        <p className="font-mono text-[11px] text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
