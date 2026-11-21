import { z } from "zod";

// NIP: 10 cyfr z sumą kontrolną (wagi 6,5,7,2,3,4,5,6,7, modulo 11). Spacje i myślniki są dozwolone.
export function normalizeNip(value: string) {
  return value.replace(/[\s-]/g, "");
}

export function isValidNip(value: string) {
  const nip = normalizeNip(value);
  if (!/^\d{10}$/.test(nip)) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const sum = weights.reduce((acc, w, i) => acc + w * Number(nip[i]), 0);
  return sum % 11 === Number(nip[9]);
}

export const businessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nazwa musi mieć co najmniej 2 znaki")
    .max(150, "Nazwa może mieć maksymalnie 150 znaków"),
  nip: z.string().trim().min(1, "Podaj NIP").refine(isValidNip, "Niepoprawny NIP (10 cyfr)"),
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
