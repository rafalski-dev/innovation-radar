"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { type ActionResult, fail, ok, validationError } from "@/lib/action-result";
import { deleteObjects } from "@/lib/r2";
import { getSession } from "@/lib/session";
import { ownedBusinessWhere } from "@/queries/business";
import {
  type AddMemberInput,
  type BusinessInput,
  addMemberSchema,
  businessSchema,
  normalizeNip,
} from "@/validation/business";

const PATH = "/dashboard/businesses";

// Naruszenie unikalności (P2002): ten NIP jest już w bazie.
const DUPLICATE_NIP = "Organizacja z tym numerem NIP już istnieje";
function isDuplicate(error: unknown) {
  return (error as { code?: string } | null)?.code === "P2002";
}

function toData(input: BusinessInput) {
  const { nip, industry, street, postalCode, city, website, ...rest } = input;
  return {
    ...rest,
    nip: normalizeNip(nip),
    industry: industry || null,
    street,
    postalCode,
    city,
    website: website || null,
  };
}

export async function createBusiness(input: BusinessInput): Promise<ActionResult> {
  // ownerId zawsze z sesji, nigdy z formularza
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = businessSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    await db.business.create({ data: { ...toData(parsed.data), ownerId: session.user.id } });
  } catch (error) {
    if (isDuplicate(error)) return fail(DUPLICATE_NIP);
    console.error(error);
    return fail("Nie udało się dodać organizacji");
  }

  revalidatePath(PATH);
  revalidatePath("/dashboard", "layout"); // liczniki w menu
  return ok();
}

export async function updateBusiness(id: string, input: BusinessInput): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = businessSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const result = await db.business.updateMany({
      where: { id, ...ownedBusinessWhere(session.user.id) },
      data: toData(parsed.data),
    });
    if (result.count === 0) return fail("Nie znaleziono organizacji");
  } catch (error) {
    if (isDuplicate(error)) return fail(DUPLICATE_NIP);
    console.error(error);
    return fail("Nie udało się zapisać zmian");
  }

  revalidatePath(PATH);
  return ok();
}

export async function deleteBusiness(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  try {
    // pliki potrzeb leżą w R2: zbieramy klucze przed kaskadowym usunięciem z bazy
    const files = await db.needFile.findMany({
      where: { need: { businessId: id, business: ownedBusinessWhere(session.user.id) } },
      select: { key: true },
    });
    const result = await db.business.deleteMany({
      where: { id, ...ownedBusinessWhere(session.user.id) },
    });
    if (result.count === 0) return fail("Nie znaleziono organizacji");
    await deleteObjects(files.map((f) => f.key));
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć organizacji");
  }

  revalidatePath(PATH);
  revalidatePath("/dashboard", "layout"); // liczniki w menu
  return ok();
}

// Osobami zarządza tylko administrator (właściciel). Dodać można osobę z istniejącym kontem.
export async function addBusinessMember(
  businessId: string,
  input: AddMemberInput,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = addMemberSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const business = await db.business.findFirst({
      where: { id: businessId, ...ownedBusinessWhere(session.user.id) },
    });
    if (!business) return fail("Tylko administrator może dodawać osoby");

    const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user) return fail("Nie ma konta z takim adresem e-mail");
    if (user.id === business.ownerId) return fail("Ta osoba jest już administratorem");

    const existing = await db.businessMember.findUnique({
      where: { businessId_userId: { businessId, userId: user.id } },
    });
    if (existing) return fail("Ta osoba jest już przypisana do organizacji");

    await db.businessMember.create({ data: { businessId, userId: user.id } });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się dodać osoby");
  }

  revalidatePath(PATH);
  return ok();
}

export async function removeBusinessMember(
  businessId: string,
  userId: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  try {
    const business = await db.business.findFirst({
      where: { id: businessId, ...ownedBusinessWhere(session.user.id) },
    });
    if (!business) return fail("Tylko administrator może usuwać osoby");

    await db.businessMember.deleteMany({ where: { businessId, userId } });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć osoby");
  }

  revalidatePath(PATH);
  return ok();
}
