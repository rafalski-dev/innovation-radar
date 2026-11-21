"use server";

import { revalidatePath } from "next/cache";
import { fail, ok, validationError, type ActionResult } from "@/lib/action-result";
import { db } from "@/lib/db";
import { phrasesKeyFor } from "@/lib/search-agent";
import { getSession } from "@/lib/session";
import { accessibleNeedWhere } from "@/queries/need";
import { searchSchema, type SearchInput } from "@/validation/search";

// Zapisuje wyszukiwanie w historii razem z zatwierdzonymi frazami i (opcjonalnie) listą wyników agenta.
export async function createSearch(input: SearchInput): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = searchSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    if (parsed.data.needId) {
      const need = await db.need.findFirst({
        where: { id: parsed.data.needId, ...accessibleNeedWhere(session.user.id) },
        select: { id: true },
      });
      if (!need) return fail("Nie znaleziono projektu");
    }
    const { results, stats, phrases } = parsed.data;
    const search = await db.search.create({
      data: {
        query: parsed.data.query,
        needId: parsed.data.needId || null,
        phrases,
        userId: session.user.id,
        ...(results && {
          status: "DONE" as const,
          startedAt: new Date(),
          phrasesKey: phrases?.length
            ? phrasesKeyFor(parsed.data.needId || parsed.data.query, phrases)
            : null,
          webSearches: stats?.webSearches,
          inputTokens: stats?.inputTokens,
          outputTokens: stats?.outputTokens,
          results: {
            create: results.map((c, position) => ({
              position,
              title: c.title,
              summary: c.summary,
              organization: c.organization || null,
              sourceName: c.sourceName,
              sourceUrl: c.sourceUrl,
              why: c.why,
            })),
          },
        }),
      },
      select: { id: true },
    });
    revalidatePath("/dashboard/search");
    return ok({ id: search.id });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się zapisać wyszukiwania");
  }
}

// Usuwa wyszukiwanie użytkownika razem z zapisanymi wynikami (kaskadowo).
export async function deleteSearch(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  try {
    const { count } = await db.search.deleteMany({ where: { id, userId: session.user.id } });
    if (count === 0) return fail("Nie znaleziono wyszukiwania");
    revalidatePath("/dashboard/search");
    return ok();
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć wyszukiwania");
  }
}
