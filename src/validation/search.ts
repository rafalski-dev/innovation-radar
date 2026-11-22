import { z } from "zod";

// Frazy do wyszukiwarki generowane przez AI: jedna lista po polsku, 3-5 najbardziej prawdopodobnych.
// Użytkownik może je edytować.
export const MAX_PHRASES = 5;

export const phrasesSchema = z.array(z.string().trim().min(1).max(200)).max(MAX_PHRASES);
export type Phrases = z.infer<typeof phrasesSchema>;

// Wynik agenta (znaleziony projekt/rozwiązanie z linkiem do źródła).
// Użytkownik wybiera, ile wyników chce (1-MAX_TOTAL_RESULTS, domyślnie DEFAULT_RESULTS_LIMIT).
// „Znajdź więcej” dokłada kolejne, łącznie do MAX_TOTAL_RESULTS.
export const DEFAULT_RESULTS_LIMIT = 3;
export const MAX_TOTAL_RESULTS = 9;
export const resultsLimitSchema = z.number().int().min(1).max(MAX_TOTAL_RESULTS);
export const candidateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  summary: z.string().trim().min(1).max(800),
  organization: z.string().trim().max(200),
  sourceName: z.string().trim().min(1).max(100),
  // tylko http(s): odrzuca m.in. javascript: (adres trafia do <a href>)
  sourceUrl: z.url({ protocol: /^https?$/ }).max(1000),
  why: z.string().trim().min(1).max(500),
  // skala gotowości technologicznej 1-9 oceniona na podstawie źródła; null = nie da się ocenić
  trl: z.number().int().min(1).max(9).nullable(),
});
export type Candidate = z.infer<typeof candidateSchema>;

export const agentStatsSchema = z.object({
  webSearches: z.number().int().min(0),
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
});
export type AgentStats = z.infer<typeof agentStatsSchema>;

// Źródła, w których może szukać agent, trzyma baza (model Source, edytuje admin).
// Użytkownik zaznacza do MAX_SOURCES z nich (filtr, kontrola kosztów); identyfikuje je `slug`.
export const MAX_SOURCES = 2;
export type SourceOption = { slug: string; name: string; description: string };

export const sourceIdsSchema = z
  .array(z.string().trim().min(1).max(60))
  .min(1, "Wybierz przynajmniej jedno źródło")
  .max(MAX_SOURCES, `Możesz wybrać maksymalnie ${MAX_SOURCES} źródła`);

export const generateResultsSchema = z.object({
  needId: z.string().trim().min(1, "Wybierz projekt"),
  phrases: phrasesSchema.min(1, "Najpierw wygeneruj frazy"),
  sources: sourceIdsSchema,
  // ile wyników ma zwrócić agent w tym uruchomieniu
  limit: resultsLimitSchema.default(DEFAULT_RESULTS_LIMIT),
  // adresy już znalezionych wyników: agent ma poszukać innych materiałów („Znajdź więcej”)
  exclude: z.array(z.string().trim().max(1000)).max(MAX_TOTAL_RESULTS).optional(),
});

export const searchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(10, "Opisz, czego szukasz (min. 10 znaków)")
    .max(4000, "Maksymalnie 4000 znaków"),
  // opcjonalny projekt, którego dotyczy wyszukiwanie; pusty string = brak
  needId: z.string().trim(),
  // zatwierdzone frazy (opcjonalne)
  phrases: phrasesSchema.optional(),
  // zatwierdzona lista wyników agenta (opcjonalna) i statystyki jej wygenerowania
  results: z.array(candidateSchema).max(MAX_TOTAL_RESULTS).optional(),
  stats: agentStatsSchema.optional(),
  // źródła, w których agent szukał (do klucza cache); brak = domyślne
  sources: sourceIdsSchema.optional(),
  // żądana liczba wyników (do klucza cache); brak = domyślna
  limit: resultsLimitSchema.optional(),
});
export type SearchInput = z.infer<typeof searchSchema>;

export const generatePhrasesSchema = z.object({
  needId: z.string().trim().min(1, "Wybierz projekt"),
  // opcjonalna wskazówka przy ponownym generowaniu, np. „bardziej technicznie”
  hint: z.string().trim().max(300, "Maksymalnie 300 znaków"),
  // gdy podane: AI generuje JEDNĄ nową frazę, inną niż te już na liście
  existing: z.array(z.string().trim().max(200)).max(MAX_PHRASES).optional(),
});
export type GeneratePhrasesInput = z.infer<typeof generatePhrasesSchema>;

// Status wyszukiwania (ta sama lista co enum SearchStatus w Prismie).
export const SEARCH_STATUSES = ["DRAFT", "RUNNING", "DONE", "FAILED"] as const;
export type SearchStatusValue = (typeof SEARCH_STATUSES)[number];
export const SEARCH_STATUS_LABELS: Record<SearchStatusValue, string> = {
  DRAFT: "Nie uruchomiono",
  RUNNING: "Trwa wyszukiwanie",
  DONE: "Gotowe",
  FAILED: "Błąd",
};
