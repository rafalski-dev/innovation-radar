import { z } from "zod";

// Te same wartości co enumy w prisma/schema.prisma (bez importu Prismy, żeby działało w przeglądarce).
export const INNOVATION_TYPES = [
  "TECHNOLOGICAL",
  "ORGANIZATIONAL",
  "EDUCATIONAL",
  "SOCIAL",
  "PROCESS",
] as const;
export const INNOVATION_STAGES = ["IDEA", "PROTOTYPE", "PILOT", "IMPLEMENTED", "SCALED"] as const;
export const INNOVATION_SECTORS = [
  "EDUCATION",
  "HEALTH_QUALITY_OF_LIFE",
  "ICT",
  "MOBILITY",
  "AEROSPACE",
  "ENVIRONMENT",
  "ADMINISTRATION",
  "OTHER",
] as const;
export const INNOVATION_STATUSES = [
  "SUBMITTED",
  "ASSESSED",
  "RECOMMENDED",
  "MATCHED",
  "ARCHIVED",
] as const;
export const INNOVATION_SOURCES = ["MANUAL", "AI_EXTRACTED", "IMPORTED"] as const;

export type InnovationType = (typeof INNOVATION_TYPES)[number];
export type InnovationStage = (typeof INNOVATION_STAGES)[number];
export type InnovationSector = (typeof INNOVATION_SECTORS)[number];
export type InnovationStatus = (typeof INNOVATION_STATUSES)[number];
export type InnovationSource = (typeof INNOVATION_SOURCES)[number];

export const innovationTypeLabels: Record<InnovationType, string> = {
  TECHNOLOGICAL: "Technologiczna",
  ORGANIZATIONAL: "Organizacyjna",
  EDUCATIONAL: "Edukacyjna",
  SOCIAL: "Społeczna",
  PROCESS: "Procesowa",
};

export const innovationStageLabels: Record<InnovationStage, string> = {
  IDEA: "Pomysł",
  PROTOTYPE: "Prototyp",
  PILOT: "Pilotaż",
  IMPLEMENTED: "Wdrożona",
  SCALED: "Skalowana",
};

export const innovationSectorLabels: Record<InnovationSector, string> = {
  EDUCATION: "Edukacja",
  HEALTH_QUALITY_OF_LIFE: "Zdrowie i jakość życia",
  ICT: "ICT",
  MOBILITY: "Mobilność",
  AEROSPACE: "Lotnictwo i kosmonautyka",
  ENVIRONMENT: "Środowisko",
  ADMINISTRATION: "Administracja",
  OTHER: "Inny",
};

export const innovationStatusLabels: Record<InnovationStatus, string> = {
  SUBMITTED: "Zgłoszone",
  ASSESSED: "Ocenione",
  RECOMMENDED: "Rekomendowane",
  MATCHED: "Połączone z partnerem",
  ARCHIVED: "Archiwum",
};

export const innovationSourceLabels: Record<InnovationSource, string> = {
  MANUAL: "Ręcznie",
  AI_EXTRACTED: "Wyodrębnione przez AI",
  IMPORTED: "Import",
};

export const innovationKey = (number: number) => `RI-${number}`;

// Wartość pola „sektor”, gdy użytkownik go nie wybrał (Select nie przyjmuje pustej wartości).
export const NO_SECTOR = "NONE";

export const innovationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Tytuł musi mieć co najmniej 3 znaki")
    .max(150, "Tytuł może mieć maksymalnie 150 znaków"),
  summary: z
    .string()
    .trim()
    .min(1, "Dodaj krótkie streszczenie")
    .max(500, "Streszczenie może mieć maksymalnie 500 znaków"),
  problem: z
    .string()
    .trim()
    .min(1, "Opisz problem")
    .max(3000, "Opis może mieć maksymalnie 3000 znaków"),
  solution: z
    .string()
    .trim()
    .min(1, "Opisz rozwiązanie")
    .max(3000, "Opis może mieć maksymalnie 3000 znaków"),
  type: z.enum(INNOVATION_TYPES, { error: "Wybierz typ" }),
  stage: z.enum(INNOVATION_STAGES, { error: "Wybierz etap" }),
  sector: z.enum([...INNOVATION_SECTORS, NO_SECTOR]),
  sourceUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "Podaj poprawny adres (https://…)"),
  creators: z.string().trim().max(500, "Maksymalnie 500 znaków"),
  contactEmail: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Niepoprawny adres e-mail"),
});

export type InnovationInput = z.infer<typeof innovationSchema>;
