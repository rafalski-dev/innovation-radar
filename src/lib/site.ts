// Konfiguracja aplikacji. Przy nowym projekcie zmieniasz tylko ten plik.
export type NavItem = { href: string; label: string };

export const site = {
  name: "Radar innowacji",
  description:
    "Platforma, która prowadzi innowacje ze szkół, uczelni i samorządów od zgłoszenia do partnera.",
  nav: [{ href: "/", label: "Start" }] satisfies NavItem[],
};
