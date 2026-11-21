import { z } from "zod";

// Frazy do wyszukiwarki generowane przez AI: jedna lista po polsku, 3-5 najbardziej prawdopodobnych.
// Użytkownik może je edytować.
export const MAX_PHRASES = 5;

export const phrasesSchema = z.array(z.string().trim().min(1).max(200)).max(MAX_PHRASES);
export type Phrases = z.infer<typeof phrasesSchema>;

export const searchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(10, "Opisz, czego szukasz (min. 10 znaków)")
    .max(4000, "Maksymalnie 4000 znaków"),
  // opcjonalny projekt, którego dotyczy wyszukiwanie; pusty string = brak
  needId: z.string().trim(),
  // zatwierdzone frazy (opcjonalne)
  phrases: phrasesSchema.optional(),
});
export type SearchInput = z.infer<typeof searchSchema>;

export const generatePhrasesSchema = z.object({
  needId: z.string().trim().min(1, "Wybierz projekt"),
  // opcjonalna wskazówka przy ponownym generowaniu, np. „bardziej technicznie”
  hint: z.string().trim().max(300, "Maksymalnie 300 znaków"),
});
export type GeneratePhrasesInput = z.infer<typeof generatePhrasesSchema>;
