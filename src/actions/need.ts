"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { type ActionResult, fail, ok, validationError } from "@/lib/action-result";
import { getSession } from "@/lib/session";
import { accessibleBusinessWhere } from "@/queries/business";
import { accessibleNeedWhere } from "@/queries/need";
import { type NeedInput, needSchema } from "@/validation/need";

export async function createNeed(businessId: string, input: NeedInput): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = needSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    // potrzebę można dodać do organizacji, do której masz dostęp
    const business = await db.business.findFirst({
      where: { id: businessId, ...accessibleBusinessWhere(session.user.id) },
    });
    if (!business) return fail("Nie znaleziono organizacji");

    await db.need.create({ data: { ...parsed.data, businessId } });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się zapisać potrzeby");
  }

  revalidatePath(`/dashboard/businesses/${businessId}`);
  return ok();
}

export async function updateNeed(id: string, input: NeedInput): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = needSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const result = await db.need.updateMany({
      where: { id, ...accessibleNeedWhere(session.user.id) },
      data: parsed.data,
    });
    if (result.count === 0) return fail("Nie znaleziono potrzeby");
  } catch (error) {
    console.error(error);
    return fail("Nie udało się zapisać zmian");
  }

  revalidatePath("/dashboard/businesses", "layout");
  return ok();
}

export async function deleteNeed(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  try {
    const result = await db.need.deleteMany({
      where: { id, ...accessibleNeedWhere(session.user.id) },
    });
    if (result.count === 0) return fail("Nie znaleziono potrzeby");
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć potrzeby");
  }

  revalidatePath("/dashboard/businesses", "layout");
  return ok();
}
