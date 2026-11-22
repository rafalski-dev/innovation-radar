import { z } from "zod";
import { createHash } from "node:crypto";
import { callAnthropic, type MessagesResponse } from "@/lib/anthropic";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getSetting } from "@/lib/settings";
import {
  DEFAULT_RESULTS_LIMIT,
  candidateSchema,
  webSearchesFor,
  type AgentStats,
  type Candidate,
} from "@/validation/search";

// Agent wyszukujący (Krok 2 z docs/AGENT.md), wersja oszczędna: Haiku, web search z limitem,
// bez czytania całych stron, max 2 wywołania API i max tyle kandydatów, ile wybrał użytkownik.
// Im więcej wyników chce użytkownik, tym więcej wyszukań web_search (kontrola kosztów): `webSearchesFor`.
const MAX_CALLS = 2;

type AgentSource = { name: string; domain: string };

// Źródła wybrane przez użytkownika (aktywne w bazie). Gdyby żadne nie pasowało, bierzemy dwa pierwsze aktywne.
async function resolveSources(slugs: string[]): Promise<AgentSource[]> {
  const selected = await db.source.findMany({
    where: { slug: { in: slugs }, active: true },
    select: { name: true, domain: true },
  });
  if (selected.length > 0) return selected;
  return db.source.findMany({
    where: { active: true },
    select: { name: true, domain: true },
    orderBy: { createdAt: "asc" },
    take: 2,
  });
}

const outputSchemaFor = (limit: number) =>
  z.object({ candidates: z.array(candidateSchema).max(limit) });

export type AgentInput = {
  title: string;
  description: string;
  phrases: string[];
  sources: string[]; // slugi źródeł wybrane przez użytkownika (max MAX_SOURCES)
  limit?: number; // ile wyników ma zwrócić agent (domyślnie DEFAULT_RESULTS_LIMIT)
  exclude?: string[]; // adresy już znalezionych wyników: szukamy innych materiałów
};
export type AgentOutput = AgentStats & {
  candidates: Candidate[];
  // kandydaci, których agent zaproponował, ale odrzuciliśmy: adres nie pochodził z wyszukiwania
  // (mógł być zmyślony) albo był już na liście. Wyjaśnia, czemu wyników jest mniej niż limit.
  rejected: number;
};

const SAVE_TOOL = "zapisz_kandydatow";

const buildSystem = (
  sources: { name: string }[],
  extra: string,
  exclude: string[],
  limit: number,
) =>
  "Jesteś agentem szukającym gotowych innowacji i projektów dla firmy. Szukasz WYŁĄCZNIE przez narzędzie " +
  "web_search w podanych źródłach (polskie instytucje: " +
  sources.map((s) => s.name).join(", ") +
  "). Użyj podanych fraz jako zapytań, w razie potrzeby przeformułuj je. " +
  `Wybierz maksymalnie ${limit} najlepiej pasujących kandydatów i postaraj się wykorzystać ten limit w pełni: ` +
  `jeśli znajdziesz ${limit} różnych, sensownie pasujących materiałów, zwróć dokładnie tyle (nie mniej), a mniej tylko wtedy, ` +
  "gdy źródła naprawdę nie mają więcej. Nie wymyślaj niczego: tytuł, organizacja " +
  "i link muszą pochodzić z wyników wyszukiwania, a link musi być adresem znalezionej strony. " +
  "Jeśli czegoś nie ma w źródle, zostaw pole organization puste. Opisy po polsku, zwięzłe. " +
  "Dla każdego kandydata oceń poziom gotowości technologicznej TRL (liczba 1-9: 1-2 badania podstawowe, 3-4 koncepcja " +
  "i test w laboratorium, 5-6 prototyp w warunkach zbliżonych do rzeczywistych, 7-8 demonstrator i wdrożenie pilotażowe, " +
  "9 technologia sprawdzona w eksploatacji) WYŁĄCZNIE na podstawie informacji ze źródła; jeśli nie da się tego ocenić, " +
  "wpisz null. " +
  (exclude.length > 0
    ? `Nie zwracaj tych adresów (są już na liście), szukaj innych materiałów: ${exclude.join(", ")}. `
    : "") +
  (extra.trim() ? `Dodatkowe wytyczne administratora: ${extra.trim()} ` : "") +
  `Na końcu wywołaj narzędzie ${SAVE_TOOL}. Jeśli nic nie pasuje, wywołaj je z pustą listą.`;

async function callApi(
  messages: unknown[],
  sources: AgentSource[],
  extra: string,
  exclude: string[],
  limit: number,
): Promise<MessagesResponse> {
  const result = await callAnthropic(
    {
      max_tokens: 8000, // model „myśli” przed zapisem wyników; zbyt niski limit urywał odpowiedź i dawał 0 wyników
      system: buildSystem(sources, extra, exclude, limit),
      messages,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: webSearchesFor(limit),
          allowed_domains: sources.map((s) => s.domain),
        },
        {
          name: SAVE_TOOL,
          description: "Zapisuje znalezionych kandydatów (może być pusta lista)",
          input_schema: z.toJSONSchema(outputSchemaFor(limit), { target: "draft-7" }),
        },
      ],
    },
    55_000,
  );
  if (!result.ok) throw new Error(`Anthropic API ${result.status}: ${result.error}`);
  return result.data;
}

// Odporne parsowanie: zbyt długie pola przycinamy, a niepoprawnych kandydatów pomijamy,
// zamiast odrzucać całą odpowiedź agenta.
const FIELD_LIMITS = {
  title: 300,
  summary: 800,
  organization: 200,
  sourceName: 100,
  why: 500,
} as const;

function parseCandidates(input: unknown, limit: number): Candidate[] {
  const raw = (input as { candidates?: unknown } | null)?.candidates;
  if (!Array.isArray(raw)) return [];
  const result: Candidate[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const clipped: Record<string, unknown> = { ...item };
    for (const [key, max] of Object.entries(FIELD_LIMITS)) {
      const value = clipped[key];
      if (typeof value === "string" && value.length > max) clipped[key] = value.slice(0, max);
    }
    const trl = Number(clipped.trl);
    clipped.trl = Number.isInteger(trl) && trl >= 1 && trl <= 9 ? trl : null;
    const parsed = candidateSchema.safeParse(clipped);
    if (parsed.success) result.push(parsed.data);
  }
  return result.slice(0, limit);
}

function normalizeUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

function mockOutput(): AgentOutput {
  return {
    webSearches: 0,
    inputTokens: 0,
    outputTokens: 0,
    rejected: 0,
    candidates: [
      {
        title: "Przykład: system monitoringu jakości powietrza przy szkołach",
        summary:
          "Przykładowy kandydat z trybu testowego. Opisuje projekt, który mógłby pasować do zapytania.",
        organization: "Przykładowa gmina",
        sourceName: "NCBiR",
        sourceUrl: "https://www.gov.pl/web/ncbr",
        why: "Tryb testowy (AGENT_MOCK): wynik nie pochodzi z wyszukiwania.",
        trl: 6,
      },
      {
        title: "Przykład: sieć czujników pyłów w mieście",
        summary: "Drugi przykładowy kandydat z trybu testowego.",
        organization: "",
        sourceName: "RAD-on",
        sourceUrl: "https://radon.nauka.gov.pl/",
        why: "Tryb testowy (AGENT_MOCK): wynik nie pochodzi z wyszukiwania.",
        trl: null,
      },
    ],
  };
}

export async function runSearchAgent(input: AgentInput): Promise<AgentOutput> {
  if (env.AGENT_MOCK === "true") {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return mockOutput();
  }

  const sources = await resolveSources(input.sources);
  const extra = await getSetting("agentPromptExtra");
  const exclude = input.exclude ?? [];
  const limit = input.limit ?? DEFAULT_RESULTS_LIMIT;
  const userMessage = {
    role: "user",
    content:
      `Projekt: ${input.title}\n\nOpis:\n${input.description}\n\n` +
      `Frazy do wyszukania:\n${input.phrases.map((p) => `- ${p}`).join("\n")}`,
  };
  const messages: unknown[] = [userMessage];
  const foundUrls = new Set<string>();
  let webSearches = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let candidates: Candidate[] | undefined;

  for (let call = 0; call < MAX_CALLS && !candidates; call++) {
    const res = await callApi(messages, sources, extra, exclude, limit);
    inputTokens += res.usage.input_tokens;
    outputTokens += res.usage.output_tokens;
    webSearches += res.usage.server_tool_use?.web_search_requests ?? 0;

    // adresy, które naprawdę zwróciło wyszukiwanie (żadnych linków wymyślonych przez model)
    for (const block of res.content) {
      if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
        for (const item of block.content as { url?: string }[]) {
          if (item.url) foundUrls.add(normalizeUrl(item.url));
        }
      }
    }

    const save = res.content.find((b) => b.type === "tool_use" && b.name === SAVE_TOOL);
    if (save) {
      candidates = parseCandidates(save.input, limit);
    } else if (res.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: res.content });
    } else {
      candidates = [];
    }
  }

  const excluded = new Set(exclude.map(normalizeUrl));
  const proposed = candidates ?? [];
  const verified = proposed.filter(
    (c) => foundUrls.has(normalizeUrl(c.sourceUrl)) && !excluded.has(normalizeUrl(c.sourceUrl)),
  );
  return {
    candidates: verified,
    rejected: proposed.length - verified.length,
    webSearches,
    inputTokens,
    outputTokens,
  };
}

// Klucz cache: te same źródła, ten sam projekt (lub zapytanie) i te same frazy = ten sam wynik w ciągu 7 dni.
export function phrasesKeyFor(
  scope: string,
  phrases: string[],
  sourceSlugs: string[] = [],
  limit: number = DEFAULT_RESULTS_LIMIT,
) {
  return createHash("sha256")
    .update(
      `${[...sourceSlugs].sort().join(",")}|${limit}|${scope}|${phrases
        .map((p) => p.trim().toLowerCase())
        .sort()
        .join("|")}`,
    )
    .digest("hex");
}
