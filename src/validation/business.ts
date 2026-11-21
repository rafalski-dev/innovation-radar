import { z } from "zod";

// NIP: tylko 10 cyfr (bez sumy kontrolnej). Spacje i myślniki są dozwolone i usuwane przed zapisem.
export function normalizeNip(value: string) {
  return value.replace(/[\s-]/g, "");
}

export const businessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nazwa musi mieć co najmniej 2 znaki")
    .max(150, "Nazwa może mieć maksymalnie 150 znaków"),
  nip: z
    .string()
    .trim()
    .min(1, "Podaj NIP")
    .refine((v) => /^\d{10}$/.test(normalizeNip(v)), "NIP musi składać się z 10 cyfr"),
  industry: z.string().trim().max(100, "Maksymalnie 100 znaków"),
  street: z.string().trim().min(1, "Podaj ulicę i numer").max(150, "Maksymalnie 150 znaków"),
  postalCode: z
    .string()
    .trim()
    .min(1, "Podaj kod pocztowy")
    .regex(/^\d{2}-\d{3}$/, "Kod w formacie 00-000"),
  city: z.string().trim().min(1, "Podaj miasto").max(100, "Maksymalnie 100 znaków"),
  website: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "Podaj poprawny adres (https://…)"),
});
export type BusinessInput = z.infer<typeof businessSchema>;

export const addMemberSchema = z.object({
  email: z.string().trim().min(1, "Podaj e-mail").email("Niepoprawny adres e-mail"),
});
export type AddMemberInput = z.infer<typeof addMemberSchema>;
