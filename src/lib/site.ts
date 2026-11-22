// Konfiguracja aplikacji. Przy nowym projekcie zmieniasz tylko ten plik.
export type NavItem = { href: string; label: string };

export const site = {
  name: "Horyzont Innowacji",
  description:
    "Znajdź gotowe innowacje, patenty i projekty dla swojej firmy. Asystent AI przeszukuje źródła publiczne i uzasadnia dopasowanie.",
  // linki w górnym pasku strony publicznej (na razie brak: logo prowadzi na stronę główną)
  nav: [] as NavItem[],
};
