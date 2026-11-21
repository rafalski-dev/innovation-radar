"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { type ActionResult, fail, ok, validationError } from "@/lib/action-result";
import { type ItemInput, itemSchema } from "@/validation/item";

const PATH = "/item";

function toData(input: ItemInput) {
  return { ...input, description: input.description || null };
}

export async function createItem(input: ItemInput): Promise<ActionResult> {
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    await db.item.create({ data: toData(parsed.data) });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się dodać elementu");
  }

  revalidatePath(PATH);
  return ok();
}

export async function updateItem(id: string, input: ItemInput): Promise<ActionResult> {
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    await db.item.update({ where: { id }, data: toData(parsed.data) });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się zapisać zmian");
  }

  revalidatePath(PATH);
  return ok();
}

export async function deleteItem(id: string): Promise<ActionResult> {
  try {
    await db.item.delete({ where: { id } });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć elementu");
  }

  revalidatePath(PATH);
  return ok();
}
