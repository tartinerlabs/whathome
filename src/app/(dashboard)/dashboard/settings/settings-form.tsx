"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUser } from "@/lib/auth-client";

interface SettingsFormProps {
  name: string;
  email: string;
}

export function SettingsForm({ name, email }: SettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(name);
  const [message, setMessage] = useState<string | null>(null);

  const dirty = value.trim() !== name;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const { error } = await updateUser({ name: value.trim() });

      if (error) {
        setMessage(error.message ?? "Something went wrong.");
        return;
      }

      setMessage("Saved.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="rounded-none border-2 border-foreground"
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
          value={email}
          className="rounded-none border-2 border-foreground"
          disabled
        />
        <p className="font-mono text-xs text-muted-foreground">
          Email cannot be changed here.
        </p>
      </div>

      <button
        type="submit"
        disabled={!dirty || pending}
        className="rounded-none border-2 border-foreground bg-foreground px-6 py-3 text-sm font-bold uppercase tracking-wide text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>

      {message && (
        <p className="font-mono text-xs text-muted-foreground">{message}</p>
      )}
    </form>
  );
}
