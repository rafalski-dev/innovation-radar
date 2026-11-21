import { z } from "zod";

// PDF przy potrzebie leży w Cloudflare R2 (wysyłka z przeglądarki, bez udziału serwera Next).
export const NEED_FILE_MAX_BYTES = 20 * 1024 * 1024;
// maksymalna liczba plików PDF przy jednej potrzebie
export const NEED_FILES_MAX = 3;
export const NEED_FILE_MAX_MB = NEED_FILE_MAX_BYTES / (1024 * 1024);

// Plik już wysłany do R2, który dołączamy do potrzeby.
export type NeedAttachmentInput = { key: string; fileName: string };

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export const needSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Tytuł musi mieć co najmniej 3 znaki")
    .max(150, "Tytuł może mieć maksymalnie 150 znaków"),
  // wymagane: organizacja (poza schematem), tytuł i opis; link i pliki PDF są opcjonalne
  description: z.string().trim().min(1, "Opisz potrzebę").max(4000, "Maksymalnie 4000 znaków"),
  // opcjonalny link; pusty string = brak
  linkUrl: z
    .string()
    .trim()
    .max(500, "Maksymalnie 500 znaków")
    .refine((v) => v === "" || isHttpUrl(v), "Podaj poprawny adres, np. https://example.com"),
});
export type NeedInput = z.infer<typeof needSchema>;
