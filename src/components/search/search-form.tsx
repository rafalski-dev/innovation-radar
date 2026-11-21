"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";
import { Textarea } from "@/components/shadcn/textarea";
import { FormField } from "@/components/form-field";

export type SearchNeedOption = {
  id: string;
  title: string;
  description: string;
  businessName: string;
};

// Formularz wyszukiwania: wybór projektu (opcjonalny) + opis tego, czego szukamy.
// Agent AI dopiero powstaje, więc na razie formularz nie wysyła zapytania.
export function SearchForm({ needs }: { needs: SearchNeedOption[] }) {
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
    if (query.trim().length < 10) {
      setError("Opisz, czego szukasz (min. 10 znaków)");
      return;
    }
    setError(undefined);
    toast.info("Agent wyszukiwania jest w budowie. Zapytanie nie zostało jeszcze wysłane.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {needs.length > 0 && (
        <FormField label="Projekt (opcjonalnie)">
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
      <FormField label="Czego szukasz?" htmlFor="query" error={error}>
        <Textarea
          id="query"
          rows={6}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Opisz problem i oczekiwany efekt, np. „Szukamy technologii obniżającej zużycie energii w chłodniach”."
        />
      </FormField>
      <Button type="submit">
        <SearchIcon />
        Szukaj
      </Button>
    </form>
  );
}
