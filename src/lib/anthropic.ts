import { env } from "@/lib/env";

// Wspólne wywołanie Messages API Anthropic (bez SDK) dla agenta, fraz i propozycji opisu.
export const CLAUDE_MODEL = "claude-haiku-5-5";

export type ContentBlock = { type: string; [key: string]: unknown };
export type MessagesResponse = {
  content: ContentBlock[];
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    server_tool_use?: { web_search_requests?: number };
  };
};

export type AnthropicResult =
  { ok: true; data: MessagesResponse } | { ok: false; status: number; error: string };

// Zwraca wynik zamiast rzucać przy odpowiedzi HTTP z błędem; rzuca tylko przy braku klucza,
// błędzie sieci albo przekroczeniu czasu.
export async function callAnthropic(
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<AnthropicResult> {
  if (!env.ANTHROPIC_API_KEY) throw new Error("Brak ANTHROPIC_API_KEY");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({ model: CLAUDE_MODEL, ...body }),
  });
  if (!response.ok) return { ok: false, status: response.status, error: await response.text() };
  return { ok: true, data: (await response.json()) as MessagesResponse };
}

// Wejście pierwszego wywołania narzędzia (przy wymuszonym `tool_choice` zawsze jest jedno).
export function toolInput(data: MessagesResponse) {
  return data.content.find((block) => block.type === "tool_use")?.input;
}
