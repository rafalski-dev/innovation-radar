import { z } from "zod";

// Rodzaje zgłoszeń z przycisku „Pomoc”: ta sama lista co enum FeedbackType w Prisma.
export const FEEDBACK_TYPES = ["RADAR_PROBLEM", "SOURCE_PROBLEM", "CHANGE_PROPOSAL"] as const;
export type FeedbackKind = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_LABELS: Record<FeedbackKind, string> = {
  RADAR_PROBLEM: "Zgłoś problem z radarem",
  SOURCE_PROBLEM: "Zgłoś problem ze źródłem",
  CHANGE_PROPOSAL: "Zaproponuj zmianę",
};

export const FEEDBACK_MESSAGE_MAX = 2000;

export const feedbackSchema = z.object({
  type: z.enum(FEEDBACK_TYPES),
  subject: z.string().trim().max(150, "Maksymalnie 150 znaków").optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Opisz sprawę w kilku słowach (minimum 10 znaków)")
    .max(FEEDBACK_MESSAGE_MAX, `Maksymalnie ${FEEDBACK_MESSAGE_MAX} znaków`),
  email: z.email("Podaj poprawny adres e-mail").optional().or(z.literal("")),
  pageUrl: z.string().max(500),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
