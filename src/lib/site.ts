// Konfiguracja aplikacji. Przy nowym projekcie zmieniasz tylko ten plik.
export type NavItem = { href: string; label: string };

export const site = {
  name: "Horyzont innowacji",
  description:
    "Znajdź gotowe innowacje, patenty i projekty dla swojej firmy. Asystent AI przeszukuje źródła publiczne i uzasadnia dopasowanie.",
  nav: [{ href: "/", label: "Start" }] satisfies NavItem[],
};
