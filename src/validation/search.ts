import { z } from "zod";

export const searchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(10, "Opisz, czego szukasz (min. 10 znaków)")
    .max(4000, "Maksymalnie 4000 znaków"),
  // opcjonalny projekt, którego dotyczy wyszukiwanie; pusty string = brak
  needId: z.string().trim(),
});
export type SearchInput = z.infer<typeof searchSchema>;
