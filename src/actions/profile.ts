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

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return fail("Nie znaleziono konta");

  // pola zależne od roli (jak przy rejestracji); roli nie da się tu zmienić
  const { name, organization, position, interests } = parsed.data;
  if (user.role === "OFFICIAL" && (!organization || !position)) {
    return fail("Podaj instytucję i stanowisko");
  }
  if (user.role === "BUSINESS" && !organization) return fail("Podaj nazwę firmy");

  try {
    await db.user.update({
      where: { id: user.id },
      data: {
        name,
        organization: user.role === "USER" ? null : organization || null,
        position: user.role === "OFFICIAL" ? position || null : null,
        interests: user.role === "BUSINESS" ? interests || null : null,
      },
    });
    revalidatePath("/", "layout");
    return ok();
  } catch (error) {
    console.error(error);
    return fail("Nie udało się zapisać profilu");
  }
}
