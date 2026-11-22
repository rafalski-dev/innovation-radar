// Numeracja projektów i aspektów.
// Projekt: znacznik czasu utworzenia, np. PRJ-20261122-143012 (czas polski).
// Aspekt: kolejny numer w projekcie, np. PRJ-20261122-143012/A3 (0 = stare wpisy bez numeru).
const parts = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Warsaw",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function projectNumber(createdAt: Date) {
  // sv-SE daje "2026-11-22 14:30:12"
  const [date, time] = parts.format(createdAt).split(" ");
  return `PRJ-${date.replaceAll("-", "")}-${time.replaceAll(":", "")}`;
}

export function aspectLabel(number: number, projectCreatedAt?: Date | null) {
  if (number <= 0) return null;
  return projectCreatedAt ? `${projectNumber(projectCreatedAt)}/A${number}` : `A${number}`;
}

// Nazwa aspektu do wyświetlenia: tytuł nadany przez użytkownika, a dla starych wpisów „Aspekt A3”.
export function aspectTitle(title: string | null | undefined, number: number) {
  if (title) return title;
  return number > 0 ? `Aspekt A${number}` : "Aspekt bez tytułu";
}
