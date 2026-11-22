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

// Źródła, w których może szukać agent. Użytkownik zaznacza do MAX_SOURCES z nich (filtr, kontrola kosztów).
// Nowe źródło = nowy wpis tutaj (id, nazwa, domena do allowed_domains).
export const MAX_SOURCES = 2;
export const SOURCE_IDS = ["ncbr", "radon", "mapadotacji", "interreg"] as const;
export type SourceId = (typeof SOURCE_IDS)[number];
export const SOURCES: { id: SourceId; name: string; domain: string; description: string }[] = [
  { id: "ncbr", name: "NCBiR", domain: "gov.pl/web/ncbr", description: "projekty B+R" },
  {
    id: "radon",
    name: "RAD-on",
    domain: "radon.nauka.gov.pl",
    description: "patenty, projekty i instytucje naukowe",
  },
  {
    id: "mapadotacji",
    name: "Mapa Dotacji UE",
    domain: "mapadotacji.gov.pl",
    description: "projekty z funduszy UE",
  },
  {
    id: "interreg",
    name: "Interreg",
    domain: "interreg.gov.pl",
    description: "projekty współpracy regionów",
  },
];
export const DEFAULT_SOURCE_IDS: SourceId[] = ["ncbr", "radon"];

export const sourceIdsSchema = z
  .array(z.enum(SOURCE_IDS))
  .min(1, "Wybierz przynajmniej jedno źródło")
  .max(MAX_SOURCES, `Możesz wybrać maksymalnie ${MAX_SOURCES} źródła`);

export const generateResultsSchema = z.object({
  needId: z.string().trim().min(1, "Wybierz projekt"),
  phrases: phrasesSchema.min(1, "Najpierw wygeneruj frazy"),
  sources: sourceIdsSchema,
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
  // źródła, w których agent szukał (do klucza cache); brak = domyślne
  sources: sourceIdsSchema.optional(),
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
