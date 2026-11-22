"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, fail, ok, validationError } from "@/lib/action-result";
import { isAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  blockedEmailSchema,
  blockedTopicSchema,
  type SettingsInput,
  type SourceInput,
  settingsSchema,
  sourceSchema,
} from "@/validation/admin";

const PATH = "/dashboard/admin";

// Każda akcja panelu sprawdza rolę ADMIN po stronie serwera (UI to tylko wygoda).
async function guard(): Promise<ActionResult | null> {
  return (await isAdminSession()) ? null : fail("Brak uprawnień administratora");
}

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function createSource(input: SourceInput): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  const parsed = sourceSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const base = slugify(parsed.data.name) || "zrodlo";
    let slug = base;
    for (let i = 2; await db.source.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
    await db.source.create({ data: { ...parsed.data, slug } });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się dodać źródła");
  }
  revalidatePath(PATH);
  return ok();
}

export async function updateSource(id: string, input: SourceInput): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  const parsed = sourceSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    await db.source.update({ where: { id }, data: parsed.data });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się zapisać źródła");
  }
  revalidatePath(PATH);
  return ok();
}

export async function deleteSource(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await db.source.delete({ where: { id } });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć źródła");
  }
  revalidatePath(PATH);
  return ok();
}

export async function addBlockedEmail(pattern: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  const parsed = blockedEmailSchema.safeParse(pattern);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Niepoprawny adres");
  try {
    await db.blockedEmail.upsert({
      where: { pattern: parsed.data },
      update: {},
      create: { pattern: parsed.data },
    });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się dodać wpisu");
  }
  revalidatePath(PATH);
  return ok();
}

export async function removeBlockedEmail(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await db.blockedEmail.deleteMany({ where: { id } });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć wpisu");
  }
  revalidatePath(PATH);
  return ok();
}

export async function addBlockedTopic(phrase: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  const parsed = blockedTopicSchema.safeParse(phrase);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Niepoprawna fraza");
  try {
    await db.blockedTopic.upsert({
      where: { phrase: parsed.data },
      update: {},
      create: { phrase: parsed.data },
    });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się dodać wpisu");
  }
  revalidatePath(PATH);
  return ok();
}

export async function removeBlockedTopic(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await db.blockedTopic.deleteMany({ where: { id } });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć wpisu");
  }
  revalidatePath(PATH);
  return ok();
}

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    await db.$transaction(
      Object.entries(parsed.data).map(([key, value]) =>
        db.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        }),
      ),
    );
  } catch (error) {
    console.error(error);
    return fail("Nie udało się zapisać ustawień");
  }
  revalidatePath(PATH);
  return ok();
}
