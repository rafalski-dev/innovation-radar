import { db } from "@/lib/db";

// Ustawienia admina (model Setting, klucz-wartość). Brak wpisu = wartość domyślna z kodu.
export const SETTING_DEFAULTS = {
  // dodatkowe instrukcje dopisywane do promptów AI (rozszerzają zakres: branże, słownictwo, priorytety)
  phrasesPromptExtra: "",
  agentPromptExtra: "",
  // limit uruchomień agenta na użytkownika w oknie 30 minut
  agentRunLimit: "5",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;

export async function getSettings(): Promise<Record<SettingKey, string>> {
  const rows = await db.setting.findMany();
  const result: Record<SettingKey, string> = { ...SETTING_DEFAULTS };
  for (const row of rows) {
    if (row.key in SETTING_DEFAULTS) result[row.key as SettingKey] = row.value;
  }
  return result;
}

export async function getSetting(key: SettingKey): Promise<string> {
  const row = await db.setting.findUnique({ where: { key } });
  return row?.value ?? SETTING_DEFAULTS[key];
}

export async function getNumberSetting(key: SettingKey, min: number, max: number) {
  const value = Number.parseInt(await getSetting(key), 10);
  const fallback = Number.parseInt(SETTING_DEFAULTS[key], 10);
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}
