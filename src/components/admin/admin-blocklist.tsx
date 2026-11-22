"use client";

import { useState, useTransition } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action-result";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";

type Entry = { id: string; value: string };

// Wspólna lista „czarna lista”: dodawanie wpisu i usuwanie (e-maile albo tematy).
export function AdminBlocklist({
  entries,
  placeholder,
  onAdd,
  onRemove,
  emptyText,
}: {
  entries: Entry[];
  placeholder: string;
  onAdd: (value: string) => Promise<ActionResult>;
  onRemove: (id: string) => Promise<ActionResult>;
  emptyText: string;
}) {
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState("");

  function add() {
    if (!value.trim()) return;
    startTransition(async () => {
      const result = await onAdd(value);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setValue("");
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await onRemove(id);
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <div className="space-y-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="max-w-sm"
        />
        <Button type="submit" size="sm" className="h-9" disabled={pending || !value.trim()}>
          <PlusIcon />
          Dodaj
        </Button>
      </form>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="inline-flex items-center gap-1 rounded-full border py-0.5 pr-1 pl-3 text-sm"
            >
              {entry.value}
              <Button
                variant="ghost"
                size="icon-xs"
                disabled={pending}
                onClick={() => remove(entry.id)}
              >
                <XIcon />
                <span className="sr-only">Usuń {entry.value}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
