const pad = (n: number) => String(n).padStart(2, "0");

// Domyślna nazwa zapisywanego raportu: „Projekt_<tytuł>_<data i godzina>”, np. Projekt_Recykling_2026-11-22_14-30-12.
// Czas lokalny użytkownika; znaki niedozwolone w nazwach plików są usuwane.
export function reportFileName(projectTitle: string, date: Date) {
  const stamp =
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  const safe = projectTitle
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 60)
    .replace(/^_+|_+$/g, "");
  return `Projekt_${safe || "raport"}_${stamp}`;
}
