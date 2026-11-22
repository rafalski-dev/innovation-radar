import { z } from "zod";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { callAnthropic, toolInput } from "@/lib/anthropic";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { blockedTopicMessage, findBlockedTopic } from "@/lib/blocklist";
import { getSession } from "@/lib/session";
import { getSetting } from "@/lib/settings";
import { accessibleProjectWhere } from "@/queries/project";
import { generatePhrasesSchema, phrasesSchema, type Phrases } from "@/validation/search";

// Limit generowań na użytkownika w oknie 30 minut (kontrola kosztów API).
const WINDOW_LIMIT = 20;
const WINDOW_MINUTES = 30;
const WINDOW_MS = WINDOW_MINUTES * 60 * 1000;
const outputSchema = z.object({ phrases: phrasesSchema });
const singleOutputSchema = z.object({ phrases: phrasesSchema.max(1) });

function respond(result: ActionResult<Phrases>, status = 200) {
  return Response.json(result, { status });
}

// POST /api/search/phrases  { projectId, hint }  →  { success, data: string[] } | { success: false, error }
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
    const project = await db.project.findFirst({
      where: { id: body.data.projectId, ...accessibleProjectWhere(session.user.id) },
      select: { title: true, description: true, linkUrls: true },
    });
    if (!project) return respond(fail("Nie znaleziono projektu"), 404);
    const blocked = await findBlockedTopic(project.title, project.description);
    if (blocked) return respond(fail(blockedTopicMessage(blocked)), 400);
    const extra = await getSetting("phrasesPromptExtra");

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

    const single = body.data.existing !== undefined;
    const existing = (body.data.existing ?? []).filter(Boolean);

    // Wymuszamy narzędzie, żeby dostać JSON zgodny ze schematem.
    const result = await callAnthropic(
      {
        max_tokens: single ? 200 : 500,
        system:
          (single
            ? "Podaj dokładnie JEDNĄ nową frazę do wyszukiwarki (po polsku, do 8 słów), inną niż podane już frazy i " +
              "zgodną ze wskazówką użytkownika, jeśli ją podał. "
            : "") +
          "Jesteś ekspertem od wyszukiwania innowacji w bazach: patenty (UPRP, EPO), publikacje (PBN, PPM, BazTech), " +
          "projekty (NCBiR, Interreg, Mapa Dotacji UE). Na podstawie opisu projektu firmy podaj od 3 do 5 NAJBARDZIEJ " +
          "prawdopodobnych fraz, które warto wpisać w wyszukiwarkę, aby znaleźć pasujące rozwiązania. " +
          "Frazy po polsku, konkretne, każda do 8 słów, od najtrafniejszej. Nigdy więcej niż 5. " +
          "Nie wymyślaj faktów spoza opisu, bez numeracji." +
          (extra ? ` Dodatkowe wytyczne administratora: ${extra}` : ""),
        messages: [
          {
            role: "user",
            content:
              `Projekt: ${project.title}\n\nOpis:\n${project.description}` +
              (project.linkUrls.length ? `\n\nLinki: ${project.linkUrls.join(", ")}` : "") +
              (single && existing.length
                ? `\n\nFrazy już na liście (nie powtarzaj ich): ${existing.join("; ")}`
                : "") +
              (body.data.hint ? `\n\nWskazówka użytkownika do tych fraz: ${body.data.hint}` : ""),
          },
        ],
        tools: [
          {
            name: "zapisz_frazy",
            description: "Zapisuje wygenerowane frazy do wyszukiwarki",
            input_schema: z.toJSONSchema(single ? singleOutputSchema : outputSchema, {
              target: "draft-7",
            }),
          },
        ],
        tool_choice: { type: "tool", name: "zapisz_frazy" },
      },
      30_000,
    );
    if (!result.ok) {
      console.error("Anthropic API:", result.status, result.error);
      return respond(fail("Nie udało się wygenerować fraz. Spróbuj ponownie"), 502);
    }
    const output = (single ? singleOutputSchema : outputSchema).safeParse(toolInput(result.data));
    if (!output.success) {
      return respond(fail("Model zwrócił niepoprawne frazy. Spróbuj ponownie"), 502);
    }
    return respond(ok(output.data.phrases));
  } catch (error) {
    console.error(error);
    return respond(fail("Nie udało się wygenerować fraz. Spróbuj ponownie"), 500);
  }
}
