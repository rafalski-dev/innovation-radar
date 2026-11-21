"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { type ActionResult, fail, ok, validationError } from "@/lib/action-result";
import { getSession } from "@/lib/session";
import { type InnovationInput, NO_SECTOR, innovationSchema } from "@/validation/innovation";

const PATH = "/dashboard";

export async function createInnovation(input: InnovationInput): Promise<ActionResult<number>> {
  // authorId zawsze z sesji, nigdy z formularza
  const session = await getSession();
  if (!session) return fail("Zaloguj się, aby zgłosić pomysł");

  const parsed = innovationSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { sector, sourceUrl, creators, contactEmail, ...rest } = parsed.data;

  try {
    const created = await db.innovation.create({
      data: {
        ...rest,
        sector: sector === NO_SECTOR ? null : sector,
        sourceUrl: sourceUrl || null,
        creators: creators || null,
        contactEmail: contactEmail || null,
        authorId: session.user.id,
      },
    });
    revalidatePath(PATH);
    return ok(created.number);
  } catch (error) {
    console.error(error);
    return fail("Nie udało się zapisać pomysłu");
  }
}
