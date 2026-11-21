import { z } from "zod";

export const needSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Tytuł musi mieć co najmniej 3 znaki")
    .max(150, "Tytuł może mieć maksymalnie 150 znaków"),
  expectedOutcome: z
    .string()
    .trim()
    .min(1, "Opisz oczekiwany efekt")
    .max(2000, "Maksymalnie 2000 znaków"),
  description: z
    .string()
    .trim()
    .min(1, "Opisz zapotrzebowanie")
    .max(4000, "Maksymalnie 4000 znaków"),
});
export type NeedInput = z.infer<typeof needSchema>;
