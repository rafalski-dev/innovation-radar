"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { type ActionResult, fail, ok, validationError } from "@/lib/action-result";
import { getSession } from "@/lib/session";
import { visibleInnovationWhere } from "@/queries/innovation";
import {
  type InnovationInput,
  NO_SECTOR,
  NO_TEAM,
  innovationSchema,
} from "@/validation/innovation";

const PATH = "/dashboard";

function toData(input: InnovationInput) {
  const { sector, sourceUrl, creators, contactEmail, teamId, ...rest } = input;
  return {
    ...rest,
    sector: sector === NO_SECTOR ? null : sector,
    sourceUrl: sourceUrl || null,
    creators: creators || null,
    contactEmail: contactEmail || null,
    teamId: teamId === NO_TEAM ? null : teamId,
  };
}

// Zespół można wskazać tylko wtedy, gdy użytkownik jest jego członkiem.
async function isMember(userId: string, teamId: string | null) {
  if (!teamId) return true;
  const count = await db.teamMember.count({ where: { userId, teamId } });
  return count > 0;
}

export async function createInnovation(input: InnovationInput): Promise<ActionResult<number>> {
  // authorId zawsze z sesji, nigdy z formularza
  const session = await getSession();
  if (!session) return fail("Zaloguj się, aby zgłosić pomysł");

  const parsed = innovationSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const data = toData(parsed.data);

  try {
    if (!(await isMember(session.user.id, data.teamId)))
      return fail("Nie należysz do tego zespołu");
    const created = await db.innovation.create({ data: { ...data, authorId: session.user.id } });
    revalidatePath(PATH);
    return ok(created.number);
  } catch (error) {
    console.error(error);
    return fail("Nie udało się zapisać pomysłu");
  }
}

export async function updateInnovation(id: string, input: InnovationInput): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = innovationSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const data = toData(parsed.data);

  try {
    const existing = await db.innovation.findFirst({
      where: { id, ...visibleInnovationWhere(session.user.id) },
    });
    if (!existing) return fail("Nie znaleziono pomysłu");
    if (existing.status !== "SUBMITTED") return fail("Pomysł po ocenie nie podlega edycji");
    if (!(await isMember(session.user.id, data.teamId)))
      return fail("Nie należysz do tego zespołu");

    await db.innovation.update({ where: { id }, data });
    revalidatePath(PATH);
    return ok();
  } catch (error) {
    console.error(error);
    return fail("Nie udało się zapisać zmian");
  }
}

export async function deleteInnovation(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  try {
    const existing = await db.innovation.findFirst({
      where: { id, ...visibleInnovationWhere(session.user.id) },
    });
    if (!existing) return fail("Nie znaleziono pomysłu");
    if (existing.status !== "SUBMITTED") return fail("Pomysł po ocenie nie podlega usunięciu");

    await db.innovation.delete({ where: { id } });
    revalidatePath(PATH);
    return ok();
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć pomysłu");
  }
}
