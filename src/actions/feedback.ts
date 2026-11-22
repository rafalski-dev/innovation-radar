"use server";

import { db } from "@/lib/db";
import { type ActionResult, fail, ok, validationError } from "@/lib/action-result";
import { getSession } from "@/lib/session";
import { type FeedbackInput, feedbackSchema } from "@/validation/feedback";

// Zgłoszenie z przycisku „Pomoc”. Działa też bez logowania (wtedy kontaktem jest podany e-mail).
export async function submitFeedback(input: FeedbackInput): Promise<ActionResult> {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const session = await getSession();
    const { subject, email, ...rest } = parsed.data;
    await db.feedback.create({
      data: {
        ...rest,
        subject: subject || null,
        email: session?.user.email ?? (email || null),
        userId: session?.user.id ?? null,
      },
    });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się wysłać zgłoszenia");
  }
  return ok();
}
