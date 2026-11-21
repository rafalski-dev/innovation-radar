"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { createSearch } from "@/actions/search";
import type { ActionResult } from "@/lib/action-result";
import { FormField } from "@/components/form-field";
import { PhrasesEditor } from "@/components/search/phrases-editor";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { searchSchema, type Phrases } from "@/validation/search";

export type SearchNeedOption = {
  id: string;
  title: string;
  description: string;
  businessName: string;
};

// POST /api/search/phrases: AI zwraca 3-5 fraz (nic nie zapisuje).
async function requestPhrases(needId: string, hint: string): Promise<ActionResult<Phrases>> {
  try {
    const response = await fetch("/api/search/phrases", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ needId, hint }),
    });
    return (await response.json()) as ActionResult<Phrases>;
  } catch {
    return { success: false, error: "Brak połączenia z serwerem" };
  }
}

// Formularz nowego wyszukiwania: wybór projektu (opcjonalny) + opis tego, czego szukamy.
export function SearchForm({ needs }: { needs: SearchNeedOption[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [needId, setNeedId] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string>();
  const [phrases, setPhrases] = useState<Phrases>();
  const [hint, setHint] = useState("");
  const [generating, startGenerating] = useTransition();

  function generate() {
    if (!needId) {
      setError("Wybierz projekt, z którego mam wygenerować frazy");
      return;
    }
    setError(undefined);
    startGenerating(async () => {
      const result = await requestPhrases(needId, hint);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setPhrases(result.data);
    });
  }

  function selectNeed(id: string) {
    setNeedId(id);
    const need = needs.find((n) => n.id === id);
    if (need && !query.trim()) setQuery(need.description);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    // puste frazy (dodane i niewypełnione) odrzucamy
    const cleaned = phrases?.map((v) => v.trim()).filter(Boolean);
    const input = { query, needId, phrases: cleaned };
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
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">Frazy do wyszukiwarki</p>
            <p className="text-xs text-muted-foreground">
              AI proponuje 3–5 najbardziej prawdopodobnych fraz na podstawie opisu projektu. Popraw
              je albo wygeneruj nowe.
            </p>
          </div>
          {!phrases && (
            <Button type="button" variant="outline" onClick={generate} disabled={generating}>
              <SparklesIcon />
              {generating ? "Generuję…" : "Generuj frazy"}
            </Button>
          )}
        </div>
        {phrases && (
          <>
            <PhrasesEditor value={phrases} onChange={setPhrases} />
            <div className="flex flex-wrap items-center gap-2 border-t pt-4">
              <Input
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="Wskazówka do nowych fraz (opcjonalnie), np. „bardziej technicznie”"
                className="min-w-0 flex-1"
                maxLength={300}
              />
              <Button type="button" variant="outline" onClick={generate} disabled={generating}>
                <SparklesIcon />
                {generating ? "Generuję…" : "Generuj ponownie"}
              </Button>
            </div>
          </>
        )}
      </div>
      <Button type="submit" disabled={pending || generating}>
        <SearchIcon />
        {pending ? "Zapisywanie…" : "Szukaj"}
      </Button>
    </form>
  );
}
