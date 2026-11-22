import { z } from "zod";

// PDF przy potrzebie leży w Cloudflare R2 (wysyłka z przeglądarki, bez udziału serwera Next).
export const NEED_FILE_MAX_BYTES = 20 * 1024 * 1024;
// maksymalna liczba plików PDF przy jednej potrzebie
export const NEED_FILES_MAX = 3;
// maksymalna liczba linków przy jednej potrzebie
export const NEED_LINKS_MAX = 3;
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
  description: z.string().trim().min(1, "Opisz projekt").max(4000, "Maksymalnie 4000 znaków"),
  // opcjonalne linki (do NEED_LINKS_MAX); puste pola są pomijane przy zapisie
  linkUrls: z
    .array(
      z
        .string()
        .trim()
        .max(500, "Maksymalnie 500 znaków")
        .refine((v) => v === "" || isHttpUrl(v), "Podaj poprawny adres, np. https://example.com"),
    )
    .max(NEED_LINKS_MAX, `Maksymalnie ${NEED_LINKS_MAX} linki`),
});
// Niepuste, bez duplikatów, do NEED_LINKS_MAX: postać zapisywana w bazie.
export function cleanLinks(links: string[]) {
  return [...new Set(links.filter(Boolean))].slice(0, NEED_LINKS_MAX);
}

export type NeedInput = z.infer<typeof needSchema>;

// Propozycje AI do opisu: lista fragmentów, z których użytkownik dodaje wybrane przyciskami.
export const MAX_SUGGESTIONS = 6;
export const descriptionSuggestionsSchema = z
  .array(
    z.object({
      label: z.string().trim().min(1).max(60),
      text: z.string().trim().min(1).max(700),
    }),
  )
  .min(1)
  .max(MAX_SUGGESTIONS);
export type DescriptionSuggestion = z.infer<typeof descriptionSuggestionsSchema>[number];

// Wejście generatora: tytuł i to, co użytkownik już wpisał w opisie.
export const expandDescriptionSchema = z.object({
  title: z.string().trim().min(3, "Najpierw wpisz tytuł projektu").max(150),
  description: z
    .string()
    .trim()
    .min(15, "Wpisz kilka zdań opisu (min. 15 znaków), a AI zaproponuje uzupełnienia")
    .max(4000, "Maksymalnie 4000 znaków"),
});
export type ExpandDescriptionInput = z.infer<typeof expandDescriptionSchema>;
