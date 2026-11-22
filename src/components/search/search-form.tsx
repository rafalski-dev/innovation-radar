"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckIcon,
  InfoIcon,
  Loader2Icon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createSearch, updateSearch } from "@/actions/search";
import type { ActionResult } from "@/lib/action-result";
import { FormField } from "@/components/form-field";
import { PhrasesEditor } from "@/components/search/phrases-editor";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { ResultList } from "@/components/search/result-list";
import {
  DEFAULT_RESULTS_LIMIT,
  MAX_PHRASES,
  MAX_SOURCES,
  MAX_TOTAL_RESULTS,
  searchSchema,
  totalWebSearchesFor,
  webSearchesFor,
  type AgentStats,
  type Candidate,
  type Phrases,
  type SourceOption,
} from "@/validation/search";

export type SearchProjectOption = {
  id: string;
  title: string;
  description: string;
  businessName: string;
};

// Edytowany zapisany aspekt („Edytuj”): formularz startuje z jego tytułem, frazami i wynikami.
export type EditingAspect = {
  id: string;
  label: string | null; // numer aspektu, np. PRJ-…/A2
  title: string;
  query: string;
  phrases: string[];
  projectId: string;
  projectTitle: string;
  results: Candidate[];
};

// POST /api/search/phrases: AI zwraca 3-5 fraz (nic nie zapisuje).
async function requestPhrases(
  projectId: string,
  hint: string,
  existing?: string[], // podane = AI zwraca jedną nową frazę
): Promise<ActionResult<Phrases>> {
  try {
    const response = await fetch("/api/search/phrases", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId, hint, existing }),
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

// Odpowiedź /api/search/results; `requested` (ile wyników chciał użytkownik) dopisuje formularz.
type ApiResultsData = {
  candidates: Candidate[];
  cached: boolean;
  stats: AgentStats;
  rejected: number;
};
type ResultsData = ApiResultsData & { requested: number };

// Polska odmiana: 1 zapytanie, 2 zapytania, 5 zapytań.
function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one;
  const last = n % 10;
  return last >= 2 && last <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many;
}

// POST /api/search/results: agent szuka w źródłach dla podanych fraz (nic nie zapisuje).
async function requestResults(
  projectId: string,
  phrases: Phrases,
  sources: string[],
  limit: number,
  exclude?: string[],
): Promise<ActionResult<ApiResultsData>> {
  try {
    const response = await fetch("/api/search/results", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId, phrases, sources, limit, exclude }),
    });
    return (await response.json()) as ActionResult<ApiResultsData>;
  } catch {
    return { success: false, error: "Brak połączenia z serwerem" };
  }
}

// Formularz nowego wyszukiwania: wybór projektu (opcjonalny) + opis tego, czego szukamy.
export function SearchForm({
  projects,
  sourceOptions,
  initialProjectId,
  editing,
}: {
  projects: SearchProjectOption[];
  sourceOptions: SourceOption[]; // aktywne źródła z bazy

  initialProjectId?: string; // projekt wybrany z góry (np. z listy projektów)
  editing?: EditingAspect; // edytowany aspekt: dane przepisane, projekt zablokowany
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const initialProject = projects.find((n) => n.id === (editing?.projectId ?? initialProjectId));
  const [projectId, setProjectId] = useState(initialProject?.id ?? "");
  const [title, setTitle] = useState(editing?.title ?? "");
  const [titleError, setTitleError] = useState<string>();
  const [query, setQuery] = useState(initialProject?.description ?? editing?.query ?? "");
  const [error, setError] = useState<string>();
  const [phrases, setPhrases] = useState<Phrases | undefined>(
    editing && editing.phrases.length > 0 ? editing.phrases : undefined,
  );
  const [hint, setHint] = useState("");
  // filtr źródeł (max MAX_SOURCES): domyślnie dwa pierwsze aktywne
  const [sources, setSources] = useState<string[]>(() =>
    sourceOptions.slice(0, MAX_SOURCES).map((o) => o.slug),
  );
  const [limit, setLimit] = useState(DEFAULT_RESULTS_LIMIT); // ile wyników ma zwrócić agent (maksymalnie)
  // wyniki uwzględnione w aspekcie (kopia startuje ze wszystkimi wynikami oryginału)
  const [selectedUrls, setSelectedUrls] = useState<string[]>(() =>
    editing ? editing.results.map((c) => c.sourceUrl) : [],
  );
  const [generating, startGenerating] = useTransition();
  // frazy zatwierdzone, można szukać w źródłach (przy zastępowaniu frazy są już przepisane)
  const [approved, setApproved] = useState(!!editing && editing.phrases.length > 0);
  const [results, setResults] = useState<ResultsData | undefined>(() =>
    editing && editing.results.length > 0
      ? {
          candidates: editing.results,
          cached: false,
          rejected: 0,
          stats: { webSearches: 0, inputTokens: 0, outputTokens: 0 },
          requested: editing.results.length,
        }
      : undefined,
  );
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

  // more = „Znajdź więcej”: dokładamy kolejne materiały, pomijając już znalezione adresy
  function searchSources(more = false) {
    const list = cleanPhrases();
    if (!projectId || list.length === 0) {
      setError("Wybierz projekt i wygeneruj frazy");
      return;
    }
    setError(undefined);
    const known = more ? (results?.candidates.map((c) => c.sourceUrl) ?? []) : undefined;
    startSearching(async () => {
      const result = await requestResults(projectId, list, sources, limit, known);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      if (more && results) {
        const added = result.data.candidates;
        if (added.length === 0) {
          toast.info("Agent nie znalazł więcej nowych materiałów");
          return;
        }
        setResults({
          ...result.data,
          candidates: [...results.candidates, ...added].slice(0, MAX_TOTAL_RESULTS),
          requested: Math.min(results.requested + limit, MAX_TOTAL_RESULTS),
          rejected: results.rejected + result.data.rejected,
          stats: {
            webSearches: results.stats.webSearches + result.data.stats.webSearches,
            inputTokens: results.stats.inputTokens + result.data.stats.inputTokens,
            outputTokens: results.stats.outputTokens + result.data.stats.outputTokens,
          },
        });
        setSelectedUrls((prev) => [...prev, ...added.map((c) => c.sourceUrl)]);
        return;
      }
      setResults({ ...result.data, requested: limit });
      setSelectedUrls(result.data.candidates.map((c) => c.sourceUrl)); // domyślnie wszystkie
      if (result.data.cached) toast.success("Wynik z zapisanego aspektu (bez kosztu)");
    });
  }

  function generate() {
    if (!projectId) {
      setError("Wybierz projekt, z którego mam wygenerować frazy");
      return;
    }
    setError(undefined);
    startGenerating(async () => {
      const result = await requestPhrases(projectId, hint);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      changePhrases(result.data);
    });
  }

  // Dopisuje jedną nową frazę wygenerowaną na podstawie wskazówki, bez ruszania pozostałych.
  function generateOne() {
    if (!projectId || !phrases) return;
    setError(undefined);
    startGenerating(async () => {
      const result = await requestPhrases(projectId, hint, cleanPhrases());
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      const next = result.data[0]?.trim();
      if (!next) {
        toast.error("Nie udało się wygenerować frazy. Spróbuj ponownie");
        return;
      }
      changePhrases([...phrases, next]);
      setHint("");
    });
  }

  // Zaznaczanie źródeł: najwyżej MAX_SOURCES, co najmniej jedno. Zmiana unieważnia listę wyników.
  function toggleSource(id: string) {
    setSources((prev) => {
      if (prev.includes(id)) return prev.length > 1 ? prev.filter((x) => x !== id) : prev;
      return prev.length < MAX_SOURCES ? [...prev, id] : prev;
    });
    setResults(undefined);
  }

  function selectProject(id: string) {
    if (id !== projectId) {
      setPhrases(undefined);
      setApproved(false);
      setResults(undefined);
    }
    setProjectId(id);
    const project = projects.find((n) => n.id === id);
    if (project && !query.trim()) setQuery(project.description);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    // zapis tylko ze zatwierdzonymi frazami i gotową listą wyników (Enter w polu nie zapisuje)
    if (!approved || !results || results.candidates.length === 0) return;
    // tylko wyniki zaznaczone przez użytkownika (nieadekwatne są wykluczone)
    const chosen = results.candidates.filter((c) => selectedUrls.includes(c.sourceUrl));
    if (chosen.length === 0) {
      setError("Zaznacz przynajmniej jeden wynik do zapisania");
      return;
    }
    // puste frazy (dodane i niewypełnione) odrzucamy
    const cleaned = phrases ? cleanPhrases() : undefined;
    const input = {
      title,
      query,
      projectId,
      phrases: cleaned,
      results: chosen,
      stats: results?.stats,
      sources,
      limit,
    };
    const parsed = searchSchema.safeParse(input);
    if (!parsed.success) {
      const titleIssue = parsed.error.issues.find((i) => i.path[0] === "title");
      if (titleIssue) {
        setTitleError(titleIssue.message);
        toast.error(titleIssue.message);
        document.getElementById("aspect-title")?.focus();
      } else {
        setError(parsed.error.issues[0]?.message);
      }
      return;
    }
    setError(undefined);
    setTitleError(undefined);
    startTransition(async () => {
      // edycja zapisuje zmiany w tym samym aspekcie, nowy formularz tworzy kolejny
      const result = editing
        ? await updateSearch(editing.id, input).then((r) =>
            r.success ? { success: true as const, data: { id: editing.id } } : r,
          )
        : await createSearch(input);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Zapisano zmiany w aspekcie" : "Zapisano aspekt");
      router.push(`/dashboard/search/${result.data.id}`);
    });
  }

  const found = results?.candidates.length ?? 0;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {editing && (
        <div className="flex items-start gap-3 rounded-2xl border bg-muted/40 p-4">
          <RefreshCwIcon className="mt-0.5 size-4 shrink-0 text-brand" />
          <div className="space-y-1 text-sm">
            <p className="font-medium">
              Edytujesz aspekt{editing.label ? ` ${editing.label}` : ""}
              <span className="font-normal text-muted-foreground">
                {" "}
                · projekt: {editing.projectTitle}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Zmień tytuł, odznacz wyniki albo popraw frazy i wyszukaj ponownie. Zmiany zapiszą się
              w tym aspekcie dopiero po kliknięciu „Zapisz zmiany”; jeśli zrezygnujesz, aspekt
              zostaje bez zmian.
            </p>
          </div>
        </div>
      )}
      {projects.length > 0 && !editing && (
        <FormField label="Projekt (opcjonalnie)" error={error}>
          <div className="grid gap-2 sm:grid-cols-2">
            {projects.map((n) => (
              <label
                key={n.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-foreground/30 has-[:checked]:border-foreground/60 has-[:checked]:bg-muted/70 has-[:checked]:ring-1 has-[:checked]:ring-foreground/15"
              >
                <input
                  type="radio"
                  name="project"
                  checked={n.id === projectId}
                  onChange={() => selectProject(n.id)}
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
      <FormField label="Tytuł aspektu" htmlFor="aspect-title" error={titleError}>
        <Input
          id="aspect-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleError(undefined);
          }}
          placeholder="np. Odzysk metali metodami hydrometalurgicznymi"
          maxLength={150}
          aria-invalid={!!titleError}
        />
        <p className="text-xs text-muted-foreground">
          Krótka nazwa, po której rozpoznasz aspekt na listach i w raporcie projektu.
        </p>
      </FormField>
      <div className="space-y-4 rounded-2xl border bg-card p-4">
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
              <Button
                type="button"
                variant="outline"
                onClick={generateOne}
                disabled={generating || (phrases?.length ?? 0) >= MAX_PHRASES}
              >
                <SparklesIcon />
                {generating ? "Generuję…" : "Generuj kolejną frazę"}
              </Button>
              <Input
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="Wskazówka do nowej frazy (opcjonalnie), np. „bardziej technicznie”"
                className="min-w-0 flex-1"
                maxLength={300}
              />
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
      {/* bez wyboru projektu (zastępowanie) błędy nie mają się gdzie pokazać, więc są tutaj */}
      {error && (editing || projects.length === 0) && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      {approved && (
        <div className="space-y-4 rounded-2xl border bg-card p-4">
          <div>
            <p className="text-sm font-medium">Krok 2. Lista wyników ze źródeł</p>
            <p className="text-xs text-muted-foreground">
              Wybierz do {MAX_SOURCES} źródeł, w których agent ma szukać według zatwierdzonych fraz
              (do minuty). Jeśli lista jest dobra, zatwierdź aspekt.
            </p>
          </div>
          <fieldset className="grid gap-2 sm:grid-cols-2">
            <legend className="sr-only">Źródła aspektu</legend>
            {sourceOptions.map((source) => {
              const checked = sources.includes(source.slug);
              const locked = !checked && sources.length >= MAX_SOURCES;
              return (
                <label
                  key={source.slug}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-foreground/30 has-[:checked]:border-foreground/60 has-[:checked]:bg-muted/70 has-[:checked]:ring-1 has-[:checked]:ring-foreground/15",
                    locked && "cursor-not-allowed opacity-50 hover:bg-transparent",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={locked || searching}
                    onChange={() => toggleSource(source.slug)}
                    className="mt-1 accent-current"
                  />
                  <span className="grid min-w-0 gap-0.5">
                    <span className="text-sm font-medium">{source.name}</span>
                    <span className="text-xs text-muted-foreground">{source.description}</span>
                  </span>
                </label>
              );
            })}
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Wybrano {sources.length} z {MAX_SOURCES}.
            </p>
          </fieldset>
          <div className="space-y-1.5">
            <label className="flex flex-wrap items-center gap-2 text-sm">
              Maksymalna liczba wyników
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                disabled={searching}
                className="h-9 rounded-full border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {Array.from({ length: MAX_TOTAL_RESULTS }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <InfoIcon className="mt-0.5 size-3 shrink-0" />
              <span>
                To liczba wyników, których agent ma szukać, ale tylko jako górny limit, nie
                gwarancja: zostają materiały z adresem potwierdzonym przez wyszukiwanie w wybranych
                źródłach, więc wyników może być mniej. Przy {limit}{" "}
                {plural(limit, "wyniku", "wynikach", "wynikach")} agent wykona do{" "}
                {totalWebSearchesFor(limit, sources.length)} zapytań do wyszukiwarki (
                {webSearchesFor(limit)} w każdym źródle, równolegle; więcej wyników = dłuższe i
                droższe wyszukiwanie).
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => searchSources(false)}
              disabled={searching || generating}
            >
              {searching ? <Loader2Icon className="animate-spin" /> : <SearchIcon />}
              {searching ? "Szukam w źródłach…" : results ? "Szukaj od nowa" : "Szukaj w źródłach"}
            </Button>
            {results && results.candidates.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => searchSources(true)}
                disabled={searching || generating || results.candidates.length >= MAX_TOTAL_RESULTS}
              >
                <PlusIcon />
                Znajdź więcej materiałów
              </Button>
            )}
          </div>
          {results && (
            <p className="rounded-xl border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                Agent znalazł {found} z maks. {results.requested}{" "}
                {plural(results.requested, "wyniku", "wyników", "wyników")}
              </span>
              {results.stats.webSearches > 0 &&
                ` (${results.stats.webSearches} ${plural(
                  results.stats.webSearches,
                  "zapytanie",
                  "zapytania",
                  "zapytań",
                )} do wyszukiwarki)`}
              .
              {results.rejected > 0 &&
                ` ${results.rejected} ${plural(
                  results.rejected,
                  "kandydata",
                  "kandydatów",
                  "kandydatów",
                )} odrzucono, bo wyszukiwanie nie potwierdziło ich adresu lub były już na liście.`}
              {found < results.requested &&
                " Wyników jest mniej niż limit, bo w wybranych źródłach nie znaleziono więcej pasujących materiałów. Zmień frazy lub źródła albo użyj „Znajdź więcej materiałów”."}
            </p>
          )}
          {results &&
            (results.candidates.length === 0 ? (
              <p className="rounded-2xl border border-dashed py-4 text-center text-sm text-muted-foreground">
                Agent nie znalazł wyników. Zmień frazy i spróbuj ponownie.
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Odznacz wyniki nieadekwatne do projektu: nie trafią do aspektu. Zaznaczono{" "}
                  {selectedUrls.length} z {results.candidates.length}
                  {results.candidates.length >= MAX_TOTAL_RESULTS && " (maksymalna liczba wyników)"}
                  .
                </p>
                <ResultList
                  items={results.candidates}
                  selection={{
                    selected: selectedUrls,
                    onToggle: (url) =>
                      setSelectedUrls((prev) =>
                        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
                      ),
                  }}
                />
              </>
            ))}
          {results && results.candidates.length > 0 && (
            <Button type="submit" disabled={pending || searching || selectedUrls.length === 0}>
              <CheckIcon />
              {pending
                ? "Zapisywanie…"
                : `${editing ? "Zapisz zmiany" : "Zatwierdź aspekt"} (${selectedUrls.length})`}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
