"use server";

import { revalidatePath } from "next/cache";
import { fail, ok, validationError, type ActionResult } from "@/lib/action-result";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { accessibleNeedWhere } from "@/queries/need";
import { searchSchema, type SearchInput } from "@/validation/search";

// Zapisuje wyszukiwanie w historii. Agent AI jeszcze nie istnieje, więc na razie bez wyników.
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
    const search = await db.search.create({
      data: {
        query: parsed.data.query,
        needId: parsed.data.needId || null,
        phrases: parsed.data.phrases,
        userId: session.user.id,
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
