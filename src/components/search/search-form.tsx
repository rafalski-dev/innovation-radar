"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { createSearch } from "@/actions/search";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/shadcn/button";
import { searchSchema } from "@/validation/search";

export type SearchNeedOption = {
  id: string;
  title: string;
  description: string;
  businessName: string;
};

// Formularz nowego wyszukiwania: wybór projektu (opcjonalny) + opis tego, czego szukamy.
export function SearchForm({ needs }: { needs: SearchNeedOption[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [needId, setNeedId] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string>();

  function selectNeed(id: string) {
    setNeedId(id);
    const need = needs.find((n) => n.id === id);
    if (need && !query.trim()) setQuery(need.description);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const input = { query, needId };
    const parsed = searchSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    startTransition(async () => {
      const result = await createSearch(input);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Zapisano wyszukiwanie");
      router.push("/dashboard/search");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {needs.length > 0 && (
        <FormField label="Projekt (opcjonalnie)" error={error}>
          <div className="grid gap-2 sm:grid-cols-2">
            {needs.map((n) => (
              <label
                key={n.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:checked]:border-primary"
              >
                <input
                  type="radio"
                  name="need"
                  checked={n.id === needId}
                  onChange={() => selectNeed(n.id)}
                  className="mt-1 accent-current"
                />
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate text-sm font-medium">{n.title}</span>
                  <span className="truncate text-xs text-muted-foreground">{n.businessName}</span>
                </span>
              </label>
            ))}
          </div>
        </FormField>
      )}
      <Button type="submit" disabled={pending}>
        <SearchIcon />
        {pending ? "Zapisywanie…" : "Szukaj"}
      </Button>
    </form>
  );
}
