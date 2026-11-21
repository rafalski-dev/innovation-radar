import { z } from "zod";

// Te same wartości co enumy w prisma/schema.prisma (bez importu Prismy, żeby działało w przeglądarce).
export const ITEM_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export const ITEM_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type ItemStatus = (typeof ITEM_STATUSES)[number];
export type ItemPriority = (typeof ITEM_PRIORITIES)[number];

export const itemStatusLabels: Record<ItemStatus, string> = {
  DRAFT: "Szkic",
  ACTIVE: "Aktywny",
  ARCHIVED: "Zarchiwizowany",
};

export const itemPriorityLabels: Record<ItemPriority, string> = {
  LOW: "Niski",
  MEDIUM: "Średni",
  HIGH: "Wysoki",
};

export const itemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nazwa musi mieć co najmniej 2 znaki")
    .max(100, "Nazwa może mieć maksymalnie 100 znaków"),
  description: z.string().trim().max(1000, "Opis może mieć maksymalnie 1000 znaków"),
  status: z.enum(ITEM_STATUSES, { error: "Wybierz status" }),
  priority: z.enum(ITEM_PRIORITIES, { error: "Wybierz priorytet" }),
});

export type ItemInput = z.infer<typeof itemSchema>;
