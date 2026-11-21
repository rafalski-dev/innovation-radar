// Konfiguracja aplikacji. Przy nowym projekcie zmieniasz tylko ten plik.
export type NavItem = { href: string; label: string };

export const site = {
  name: "Nazwa aplikacji",
  description: "Krótki opis aplikacji (uzupełnij w src/lib/site.ts).",
  nav: [
    { href: "/", label: "Start" },
    { href: "/item", label: "Elementy" },
  ] satisfies NavItem[],
};
