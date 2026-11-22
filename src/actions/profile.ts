"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { type ActionResult, fail, ok, validationError } from "@/lib/action-result";
import { getSession } from "@/lib/session";
import { type ProfileInput, profileSchema } from "@/validation/profile";

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const { firstName, lastName, position } = parsed.data;
  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        position: position || null,
      },
    });
    revalidatePath("/", "layout");
    return ok();
  } catch (error) {
    console.error(error);
    return fail("Nie udało się zapisać profilu");
  }
}
