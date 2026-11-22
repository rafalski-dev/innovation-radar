import { fail, ok, type ActionResult } from "@/lib/action-result";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getSession } from "@/lib/session";
import { z } from "zod";
import {
  type DescriptionSuggestion,
  descriptionSuggestionsSchema,
  expandDescriptionSchema,
  MAX_SUGGESTIONS,
} from "@/validation/need";

const MODEL = "claude-haiku-5-5";
// Limit generowań na użytkownika w oknie 30 minut (kontrola kosztów API).
const WINDOW_LIMIT = 10;
const WINDOW_MINUTES = 30;
const WINDOW_MS = WINDOW_MINUTES * 60 * 1000;
const outputSchema = z.object({ suggestions: descriptionSuggestionsSchema });

function respond(result: ActionResult<DescriptionSuggestion[]>, status = 200) {
  return Response.json(result, { status });
}

// POST /api/needs/expand-description  { title, description }  →  { success, data: {label, text}[] } | { success: false, error }
// Na podstawie tytułu i wpisanego opisu proponuje uzupełnienia. Niczego nie zapisuje:
// użytkownik dodaje wybrane propozycje do opisu przyciskami w formularzu.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return respond(fail("Zaloguj się"), 401);

  const body = expandDescriptionSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return respond(fail(body.error.issues[0]?.message ?? "Niepoprawne dane"), 400);

  if (!env.ANTHROPIC_API_KEY)
    return respond(fail("Brak klucza ANTHROPIC_API_KEY na serwerze"), 503);

  try {
    const used = await db.descriptionGeneration.count({
      where: { userId: session.user.id, createdAt: { gte: new Date(Date.now() - WINDOW_MS) } },
    });
    if (used >= WINDOW_LIMIT) {
      return respond(
        fail(
          `Osiągnięto limit generowania opisów (${WINDOW_LIMIT} na ${WINDOW_MINUTES} minut). Spróbuj za chwilę`,
        ),
        429,
      );
    }
    // liczymy próbę przed wywołaniem API, żeby szybkie powtórne kliknięcia też się wliczały
    await db.descriptionGeneration.create({ data: { userId: session.user.id } });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system:
          "Pomagasz firmom opisać projekt lub potrzebę innowacyjną, aby łatwiej znaleźć pasujące rozwiązania " +
          "(patenty, publikacje, projekty badawcze). Na podstawie tytułu i opisu, który wpisał użytkownik, zaproponuj " +
          `od 4 do ${MAX_SUGGESTIONS} osobnych uzupełnień opisu po polsku. Każde ma krótką etykietę ` +
          "(np. Cel, Problem, Oczekiwane rozwiązanie, Zastosowanie, Ograniczenia) i tekst z 1-3 zdań prostym językiem. " +
          "Uzupełnienia mają być niezależne, tak by użytkownik mógł dodać dowolne z nich, i NIE mogą powtarzać tego, " +
          "co już jest w opisie. Trzymaj się wyłącznie informacji od użytkownika i ich rozsądnego doprecyzowania. " +
          "NIE wymyślaj faktów: liczb, budżetów, terminów, nazw technologii, firm ani wymagań, których nie podał. " +
          "Jeśli czegoś nie wiadomo, pomiń takie uzupełnienie.",
        messages: [
          {
            role: "user",
            content: `Tytuł: ${body.data.title}\n\nOpis:\n${body.data.description}`,
          },
        ],
        tools: [
          {
            name: "zapisz_propozycje",
            description: "Zapisuje propozycje uzupełnień opisu",
            input_schema: z.toJSONSchema(outputSchema, { target: "draft-7" }),
          },
        ],
        tool_choice: { type: "tool", name: "zapisz_propozycje" },
      }),
    });
    if (!response.ok) {
      console.error("Anthropic API:", response.status, await response.text());
      return respond(fail("Nie udało się wygenerować propozycji. Spróbuj ponownie"), 502);
    }
    const data = (await response.json()) as { content: { type: string; input?: unknown }[] };
    const toolUse = data.content.find((block) => block.type === "tool_use");
    const output = outputSchema.safeParse(toolUse?.input);
    if (!output.success) {
      return respond(fail("Model zwrócił niepoprawne propozycje. Spróbuj ponownie"), 502);
    }
    return respond(ok(output.data.suggestions));
  } catch (error) {
    console.error(error);
    return respond(fail("Nie udało się wygenerować propozycji. Spróbuj ponownie"), 500);
  }
}
