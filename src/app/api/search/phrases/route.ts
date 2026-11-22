import { z } from "zod";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getSession } from "@/lib/session";
import { accessibleNeedWhere } from "@/queries/need";
import { generatePhrasesSchema, phrasesSchema, type Phrases } from "@/validation/search";

const PHRASES_MODEL = "claude-haiku-5-5";
// Limit generowań na użytkownika w oknie 30 minut (kontrola kosztów API).
const WINDOW_LIMIT = 20;
const WINDOW_MINUTES = 30;
const WINDOW_MS = WINDOW_MINUTES * 60 * 1000;
const outputSchema = z.object({ phrases: phrasesSchema });

function respond(result: ActionResult<Phrases>, status = 200) {
  return Response.json(result, { status });
}

// POST /api/search/phrases  { needId, hint }  →  { success, data: string[] } | { success: false, error }
// Generuje 3-5 fraz do wyszukiwarki na podstawie opisu projektu. Niczego nie zapisuje:
// użytkownik edytuje wynik i zatwierdza go dopiero przy zapisie wyszukiwania.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return respond(fail("Zaloguj się"), 401);

  const body = generatePhrasesSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return respond(fail(body.error.issues[0]?.message ?? "Niepoprawne dane"), 400);

  if (!env.ANTHROPIC_API_KEY)
    return respond(fail("Brak klucza ANTHROPIC_API_KEY na serwerze"), 503);

  try {
    const need = await db.need.findFirst({
      where: { id: body.data.needId, ...accessibleNeedWhere(session.user.id) },
      select: { title: true, description: true, linkUrls: true },
    });
    if (!need) return respond(fail("Nie znaleziono projektu"), 404);

    const used = await db.phraseGeneration.count({
      where: { userId: session.user.id, createdAt: { gte: new Date(Date.now() - WINDOW_MS) } },
    });
    if (used >= WINDOW_LIMIT) {
      return respond(
        fail(
          `Osiągnięto limit generowania fraz (${WINDOW_LIMIT} na ${WINDOW_MINUTES} minut). Spróbuj za chwilę`,
        ),
        429,
      );
    }
    // liczymy próbę przed wywołaniem API, żeby szybkie powtórne kliknięcia też się wliczały
    await db.phraseGeneration.create({ data: { userId: session.user.id } });

    // Messages API Anthropic wprost (bez SDK). Wymuszamy narzędzie, żeby dostać JSON zgodny ze schematem.
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        model: PHRASES_MODEL,
        max_tokens: 500,
        system:
          "Jesteś ekspertem od wyszukiwania innowacji w bazach: patenty (UPRP, EPO), publikacje (PBN, PPM, BazTech), " +
          "projekty (NCBiR, Interreg, Mapa Dotacji UE). Na podstawie opisu projektu firmy podaj od 3 do 5 NAJBARDZIEJ " +
          "prawdopodobnych fraz, które warto wpisać w wyszukiwarkę, aby znaleźć pasujące rozwiązania. " +
          "Frazy po polsku, konkretne, każda do 8 słów, od najtrafniejszej. Nigdy więcej niż 5. " +
          "Nie wymyślaj faktów spoza opisu, bez numeracji.",
        messages: [
          {
            role: "user",
            content:
              `Projekt: ${need.title}\n\nOpis:\n${need.description}` +
              (need.linkUrls.length ? `\n\nLinki: ${need.linkUrls.join(", ")}` : "") +
              (body.data.hint ? `\n\nWskazówka użytkownika do tych fraz: ${body.data.hint}` : ""),
          },
        ],
        tools: [
          {
            name: "zapisz_frazy",
            description: "Zapisuje wygenerowane frazy do wyszukiwarki",
            input_schema: z.toJSONSchema(outputSchema, { target: "draft-7" }),
          },
        ],
        tool_choice: { type: "tool", name: "zapisz_frazy" },
      }),
    });
    if (!response.ok) {
      console.error("Anthropic API:", response.status, await response.text());
      return respond(fail("Nie udało się wygenerować fraz. Spróbuj ponownie"), 502);
    }
    const data = (await response.json()) as { content: { type: string; input?: unknown }[] };
    const toolUse = data.content.find((block) => block.type === "tool_use");
    const output = outputSchema.safeParse(toolUse?.input);
    if (!output.success) {
      return respond(fail("Model zwrócił niepoprawne frazy. Spróbuj ponownie"), 502);
    }
    return respond(ok(output.data.phrases));
  } catch (error) {
    console.error(error);
    return respond(fail("Nie udało się wygenerować fraz. Spróbuj ponownie"), 500);
  }
}
