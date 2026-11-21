---
description: Start projektu na podstawie docs/PROJECT.md (plan encji → budowa)
---

1. Przeczytaj `docs/PROJECT.md` i CLAUDE.md.
2. Sprawdź, czy opis jest kompletny: cel, encje z polami i typami, relacje, strony. Wypisz braki i niejasności jako pytania. Jeśli są, zatrzymaj się i zapytaj.
3. Zaproponuj plan:
   - zmiany w `src/lib/site.ts` (nazwa, opis, nawigacja),
   - listę encji w kolejności budowy (najpierw te bez relacji),
   - usunięcie encji wzorcowej `item` po zbudowaniu pierwszej własnej encji (lista plików w README),
   - funkcje AI i strony spoza CRUD (osobno, na koniec).
4. Poczekaj na akceptację planu.
5. Po akceptacji buduj encje po kolei według `.claude/commands/new-feature.md`, a po każdej uruchom `npm run typecheck`.
6. Na koniec zaktualizuj `docs/PROJECT.md` i podaj krótką listę zmienionych plików.
