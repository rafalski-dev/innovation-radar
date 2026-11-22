import { z } from "zod";
import { createHash } from "node:crypto";
import { env } from "@/lib/env";
import {
  MAX_CANDIDATES,
  candidateSchema,
  DEFAULT_SOURCE_IDS,
  SOURCES,
  type AgentStats,
  type Candidate,
  type SourceId,
} from "@/validation/search";

// Agent wyszukujący (Krok 2 z docs/AGENT.md), wersja oszczędna: Haiku, web search z limitem,
// bez czytania całych stron, max 2 wywołania API i max 3 kandydatów.
export const AGENT_MODEL = "claude-haiku-5-5";
const MAX_SEARCHES = 3;
const MAX_CALLS = 2;

function sourcesFor(ids: SourceId[]) {
  const selected = SOURCES.filter((s) => ids.includes(s.id));
  return selected.length > 0 ? selected : SOURCES.filter((s) => DEFAULT_SOURCE_IDS.includes(s.id));
}

const outputSchema = z.object({ candidates: z.array(candidateSchema).max(MAX_CANDIDATES) });

export type AgentInput = {
  title: string;
  description: string;
  phrases: string[];
  sources: SourceId[]; // wybrane przez użytkownika (max MAX_SOURCES)
};
export type AgentOutput = AgentStats & { candidates: Candidate[] };

type Block = { type: string; [key: string]: unknown };
type ApiResponse = {
  content: Block[];
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    server_tool_use?: { web_search_requests?: number };
  };
};

const SAVE_TOOL = "zapisz_kandydatow";

const buildSystem = (sources: { name: string }[]) =>
  "Jesteś agentem szukającym gotowych innowacji i projektów dla firmy. Szukasz WYŁĄCZNIE przez narzędzie " +
  "web_search w podanych źródłach (polskie instytucje: " +
  sources.map((s) => s.name).join(", ") +
  "). Użyj podanych fraz jako zapytań, w razie potrzeby przeformułuj je. " +
  `Wybierz maksymalnie ${MAX_CANDIDATES} najlepiej pasujących kandydatów. Nie wymyślaj niczego: tytuł, organizacja ` +
  "i link muszą pochodzić z wyników wyszukiwania, a link musi być adresem znalezionej strony. " +
  "Jeśli czegoś nie ma w źródle, zostaw pole organization puste. Opisy po polsku, zwięzłe. " +
  `Na końcu wywołaj narzędzie ${SAVE_TOOL}. Jeśli nic nie pasuje, wywołaj je z pustą listą.`;

async function callApi(
  messages: unknown[],
  sources: { name: string; domain: string }[],
): Promise<ApiResponse> {
  if (!env.ANTHROPIC_API_KEY) throw new Error("Brak ANTHROPIC_API_KEY");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    signal: AbortSignal.timeout(55_000),
    body: JSON.stringify({
      model: AGENT_MODEL,
      max_tokens: 2000,
      system: buildSystem(sources),
      messages,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: MAX_SEARCHES,
          allowed_domains: sources.map((s) => s.domain),
        },
        {
          name: SAVE_TOOL,
          description: "Zapisuje znalezionych kandydatów (może być pusta lista)",
          input_schema: z.toJSONSchema(outputSchema, { target: "draft-7" }),
        },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(`Anthropic API ${response.status}: ${await response.text()}`);
  }
  return (await response.json()) as ApiResponse;
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

function parseCandidates(input: unknown): Candidate[] {
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
    const parsed = candidateSchema.safeParse(clipped);
    if (parsed.success) result.push(parsed.data);
  }
  return result.slice(0, MAX_CANDIDATES);
}

function normalizeUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

function mockOutput(): AgentOutput {
  return {
    webSearches: 0,
    inputTokens: 0,
    outputTokens: 0,
    candidates: [
      {
        title: "Przykład: system monitoringu jakości powietrza przy szkołach",
        summary:
          "Przykładowy kandydat z trybu testowego. Opisuje projekt, który mógłby pasować do zapytania.",
        organization: "Przykładowa gmina",
        sourceName: "NCBiR",
        sourceUrl: "https://www.gov.pl/web/ncbr",
        why: "Tryb testowy (AGENT_MOCK): wynik nie pochodzi z wyszukiwania.",
      },
      {
        title: "Przykład: sieć czujników pyłów w mieście",
        summary: "Drugi przykładowy kandydat z trybu testowego.",
        organization: "",
        sourceName: "RAD-on",
        sourceUrl: "https://radon.nauka.gov.pl/",
        why: "Tryb testowy (AGENT_MOCK): wynik nie pochodzi z wyszukiwania.",
      },
    ],
  };
}

export async function runSearchAgent(input: AgentInput): Promise<AgentOutput> {
  if (env.AGENT_MOCK === "true") {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return mockOutput();
  }

  const sources = sourcesFor(input.sources);
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
    const res = await callApi(messages, sources);
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

    // TYMCZASOWE logi diagnostyczne (usunąć po debugowaniu)
    console.log(
      "[agent] stop_reason:",
      res.stop_reason,
      "| bloki:",
      res.content.map((b) => b.type).join(", "),
    );
    for (const block of res.content) {
      if (block.type === "web_search_tool_result") {
        console.log("[agent] web_search_tool_result:", JSON.stringify(block.content).slice(0, 600));
      }
      if (block.type === "text") console.log("[agent] tekst:", String(block.text).slice(0, 400));
    }

    const save = res.content.find((b) => b.type === "tool_use" && b.name === SAVE_TOOL);
    if (save) {
      candidates = parseCandidates(save.input);
    } else if (res.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: res.content });
    } else {
      candidates = [];
    }
  }

  console.log(
    "[agent] kandydaci przed filtrem:",
    candidates?.length ?? 0,
    "| znalezione URL-e:",
    foundUrls.size,
  );
  const verified = (candidates ?? []).filter((c) => foundUrls.has(normalizeUrl(c.sourceUrl)));
  return { candidates: verified, webSearches, inputTokens, outputTokens };
}

// Klucz cache: te same źródła, ten sam projekt (lub zapytanie) i te same frazy = ten sam wynik w ciągu 7 dni.
export function phrasesKeyFor(scope: string, phrases: string[], sourceIds?: SourceId[]) {
  return createHash("sha256")
    .update(
      `${sourcesFor(sourceIds ?? DEFAULT_SOURCE_IDS)
        .map((s) => s.domain)
        .sort()
        .join(",")}|${scope}|${phrases
        .map((p) => p.trim().toLowerCase())
        .sort()
        .join("|")}`,
    )
    .digest("hex");
}
