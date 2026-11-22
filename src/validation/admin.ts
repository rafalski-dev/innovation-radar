import { z } from "zod";

// Domena do allowed_domains agenta: host z opcjonalną ścieżką, np. radon.nauka.gov.pl albo gov.pl/web/ncbr.
const DOMAIN_RE =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(\/[a-z0-9._~\-/]*)?$/;

export const sourceSchema = z.object({
  name: z.string().trim().min(2, "Nazwa musi mieć co najmniej 2 znaki").max(60),
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .transform((v) => v.replace(/^https?:\/\//, "").replace(/\/+$/, ""))
    .pipe(z.string().regex(DOMAIN_RE, "Podaj domenę, np. radon.nauka.gov.pl")),
  description: z.string().trim().max(200, "Maksymalnie 200 znaków"),
  active: z.boolean(),
});
export type SourceInput = z.input<typeof sourceSchema>;

export const blockedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Podaj adres e-mail albo domenę z @")
  .max(200)
  .refine(
    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^@[^\s@]+\.[^\s@]+$/.test(v),
    "Podaj pełny adres (jan@x.pl) albo domenę z @ (@x.pl)",
  );

export const blockedTopicSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Fraza musi mieć co najmniej 3 znaki")
  .max(100, "Maksymalnie 100 znaków");

export const settingsSchema = z.object({
  phrasesPromptExtra: z.string().trim().max(1500, "Maksymalnie 1500 znaków"),
  agentPromptExtra: z.string().trim().max(1500, "Maksymalnie 1500 znaków"),
  agentRunLimit: z.coerce.number().int().min(1, "Min. 1").max(100, "Maks. 100"),
});
export type SettingsInput = z.input<typeof settingsSchema>;
