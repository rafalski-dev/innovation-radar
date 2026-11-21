import { z } from "zod";

// Frazy do wyszukiwarki generowane przez AI: jedna lista po polsku, 3-5 najbardziej prawdopodobnych.
// Użytkownik może je edytować.
export const MAX_PHRASES = 5;

export const phrasesSchema = z.array(z.string().trim().min(1).max(200)).max(MAX_PHRASES);
export type Phrases = z.infer<typeof phrasesSchema>;

// Wynik agenta (znaleziony projekt/rozwiązanie z linkiem do źródła).
export const MAX_CANDIDATES = 3;
export const candidateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  summary: z.string().trim().min(1).max(800),
  organization: z.string().trim().max(200),
  sourceName: z.string().trim().min(1).max(100),
  sourceUrl: z.url().max(1000),
  why: z.string().trim().min(1).max(500),
});
export type Candidate = z.infer<typeof candidateSchema>;

export const agentStatsSchema = z.object({
  webSearches: z.number().int().min(0),
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
});
export type AgentStats = z.infer<typeof agentStatsSchema>;

export const generateResultsSchema = z.object({
  needId: z.string().trim().min(1, "Wybierz projekt"),
  phrases: phrasesSchema.min(1, "Najpierw wygeneruj frazy"),
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
  results: z.array(candidateSchema).max(MAX_CANDIDATES).optional(),
  stats: agentStatsSchema.optional(),
});
export type SearchInput = z.infer<typeof searchSchema>;

export const generatePhrasesSchema = z.object({
  needId: z.string().trim().min(1, "Wybierz projekt"),
  // opcjonalna wskazówka przy ponownym generowaniu, np. „bardziej technicznie”
  hint: z.string().trim().max(300, "Maksymalnie 300 znaków"),
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
