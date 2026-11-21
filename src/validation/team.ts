import { z } from "zod";

export const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nazwa musi mieć co najmniej 2 znaki")
    .max(100, "Nazwa może mieć maksymalnie 100 znaków"),
});
export type TeamInput = z.infer<typeof teamSchema>;

export const addMemberSchema = z.object({
  email: z.string().trim().min(1, "Podaj e-mail").email("Niepoprawny adres e-mail"),
});
export type AddMemberInput = z.infer<typeof addMemberSchema>;
