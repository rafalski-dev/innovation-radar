"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, Loader2Icon, SearchIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { createSearch } from "@/actions/search";
import type { ActionResult } from "@/lib/action-result";
import { FormField } from "@/components/form-field";
import { PhrasesEditor } from "@/components/search/phrases-editor";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { ResultList } from "@/components/search/result-list";
import { searchSchema, type AgentStats, type Candidate, type Phrases } from "@/validation/search";

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

// Biały przycisk generowania fraz (czytelny także w trybie ciemnym).
const WHITE_BUTTON =
  "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900 " +
  "dark:border-transparent dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200";

type ResultsData = { candidates: Candidate[]; cached: boolean; stats: AgentStats };

// POST /api/search/results: agent szuka w źródłach dla podanych fraz (nic nie zapisuje).
async function requestResults(
  needId: string,
  phrases: Phrases,
): Promise<ActionResult<ResultsData>> {
  try {
    const response = await fetch("/api/search/results", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ needId, phrases }),
    });
    return (await response.json()) as ActionResult<ResultsData>;
  } catch {
    return { success: false, error: "Brak połączenia z serwerem" };
  }
}

// Formularz nowego wyszukiwania: wybór projektu (opcjonalny) + opis tego, czego szukamy.
export function SearchForm({
  needs,
  initialNeedId,
}: {
  needs: SearchNeedOption[];
  initialNeedId?: string; // projekt wybrany z góry (np. z listy projektów)
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const initialNeed = needs.find((n) => n.id === initialNeedId);
  const [needId, setNeedId] = useState(initialNeed?.id ?? "");
  const [query, setQuery] = useState(initialNeed?.description ?? "");
  const [error, setError] = useState<string>();
  const [phrases, setPhrases] = useState<Phrases>();
  const [hint, setHint] = useState("");
  const [generating, startGenerating] = useTransition();
  const [approved, setApproved] = useState(false); // frazy zatwierdzone, można szukać w źródłach
  const [results, setResults] = useState<ResultsData>();
  const [searching, startSearching] = useTransition();

  function cleanPhrases() {
    return phrases?.map((v) => v.trim()).filter(Boolean) ?? [];
  }

  function changePhrases(next: Phrases) {
    setPhrases(next);
    setApproved(false);
    setResults(undefined); // lista wyników dotyczy poprzednich fraz
  }

  function approvePhrases() {
    if (cleanPhrases().length === 0) {
      setError("Dodaj przynajmniej jedną frazę");
      return;
    }
    setError(undefined);
    setPhrases(cleanPhrases());
    setApproved(true);
  }

  function searchSources() {
    const list = cleanPhrases();
    if (!needId || list.length === 0) {
      setError("Wybierz projekt i wygeneruj frazy");
      return;
    }
    setError(undefined);
    startSearching(async () => {
      const result = await requestResults(needId, list);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setResults(result.data);
      if (result.data.cached) toast.success("Wynik z zapisanego wyszukiwania (bez kosztu)");
    });
  }

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
      changePhrases(result.data);
    });
  }

  function selectNeed(id: string) {
    if (id !== needId) {
      setPhrases(undefined);
      setApproved(false);
      setResults(undefined);
    }
    setNeedId(id);
    const need = needs.find((n) => n.id === id);
    if (need && !query.trim()) setQuery(need.description);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    // zapis tylko ze zatwierdzonymi frazami i gotową listą wyników (Enter w polu nie zapisuje)
    if (!approved || !results || results.candidates.length === 0) return;
    // puste frazy (dodane i niewypełnione) odrzucamy
    const cleaned = phrases ? cleanPhrases() : undefined;
    const input = {
      query,
      needId,
      phrases: cleaned,
      results: results?.candidates,
      stats: results?.stats,
    };
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
      router.push(`/dashboard/search/${result.data.id}`);
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
            <p className="text-sm font-medium">Krok 1. Frazy do wyszukiwarki</p>
            <p className="text-xs text-muted-foreground">
              AI proponuje 3–5 najbardziej prawdopodobnych fraz na podstawie opisu projektu. Popraw
              je albo wygeneruj nowe, a potem zatwierdź.
            </p>
          </div>
          {!phrases && (
            <Button
              type="button"
              variant="outline"
              onClick={generate}
              disabled={generating}
              className={WHITE_BUTTON}
            >
              <SparklesIcon />
              {generating ? "Generuję…" : "Generuj frazy"}
            </Button>
          )}
        </div>
        {phrases && !approved && (
          <>
            <PhrasesEditor value={phrases} onChange={changePhrases} />
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
            <Button type="button" onClick={approvePhrases} disabled={generating}>
              <CheckIcon />
              Zatwierdź frazy
            </Button>
          </>
        )}
        {phrases && approved && (
          <div className="flex flex-wrap items-start justify-between gap-2">
            <ul className="flex flex-wrap gap-2">
              {phrases.map((p) => (
                <li key={p} className="rounded-full border px-3 py-1 text-sm">
                  {p}
                </li>
              ))}
            </ul>
            <Button type="button" variant="ghost" size="sm" onClick={() => setApproved(false)}>
              Zmień frazy
            </Button>
          </div>
        )}
      </div>
      {approved && (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Krok 2. Lista wyników ze źródeł</p>
              <p className="text-xs text-muted-foreground">
                Agent przeszuka NCBiR i RAD-on według zatwierdzonych fraz (do minuty). Jeśli lista
                jest dobra, zatwierdź wyszukiwanie.
              </p>
            </div>
            <Button type="button" onClick={searchSources} disabled={searching || generating}>
              {searching ? <Loader2Icon className="animate-spin" /> : <SearchIcon />}
              {searching ? "Szukam w źródłach…" : results ? "Szukaj ponownie" : "Szukaj w źródłach"}
            </Button>
          </div>
          {results &&
            (results.candidates.length === 0 ? (
              <p className="rounded-lg border border-dashed py-4 text-center text-sm text-muted-foreground">
                Agent nie znalazł wyników. Zmień frazy i spróbuj ponownie.
              </p>
            ) : (
              <ResultList items={results.candidates} />
            ))}
          {results && results.candidates.length > 0 && (
            <Button type="submit" disabled={pending || searching}>
              <CheckIcon />
              {pending ? "Zapisywanie…" : "Zatwierdź wyszukiwanie"}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
