"use server";

import { revalidatePath } from "next/cache";
import { fail, ok, validationError, type ActionResult } from "@/lib/action-result";
import { db } from "@/lib/db";
import { blockedTopicMessage, findBlockedTopic } from "@/lib/blocklist";
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

  const blocked = await findBlockedTopic(parsed.data.query, ...(parsed.data.phrases ?? []));
  if (blocked) return fail(blockedTopicMessage(blocked));

  try {
    if (parsed.data.needId) {
      const need = await db.need.findFirst({
        where: { id: parsed.data.needId, ...accessibleNeedWhere(session.user.id) },
        select: { id: true, sentAt: true },
      });
      if (!need) return fail("Nie znaleziono projektu");
      if (need.sentAt)
        return fail("Raport projektu został wysłany, projekt jest zamknięty do edycji");
    }
    const { results, stats, phrases, sources, limit } = parsed.data;
    // numer aspektu: kolejny w projekcie (albo wśród aspektów użytkownika bez projektu)
    const last = await db.search.aggregate({
      _max: { number: true },
      where: parsed.data.needId
        ? { needId: parsed.data.needId }
        : { userId: session.user.id, needId: null },
    });
    const search = await db.search.create({
      data: {
        query: parsed.data.query,
        needId: parsed.data.needId || null,
        phrases,
        number: (last._max.number ?? 0) + 1,
        userId: session.user.id,
        ...(results && {
          status: "DONE" as const,
          startedAt: new Date(),
          phrasesKey: phrases?.length
            ? phrasesKeyFor(parsed.data.needId || parsed.data.query, phrases, sources, limit)
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
              trl: c.trl,
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
    return fail("Nie udało się zapisać aspektu");
  }
}

// Usuwa wyszukiwanie użytkownika razem z zapisanymi wynikami (kaskadowo).
export async function deleteSearch(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  try {
    const { count } = await db.search.deleteMany({ where: { id, userId: session.user.id } });
    if (count === 0) return fail("Nie znaleziono aspektu");
    revalidatePath("/dashboard/search");
    return ok();
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć aspektu");
  }
}
