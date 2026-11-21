# Opis projektu

> Wypełnij ten plik przed startem nowego projektu. Claude czyta go na początku każdego zadania,
> a komenda `/start-project` buduje z niego plan encji.
> Zastąp komentarze w nawiasach `<…>` swoją treścią.

## 1. Cel

<Jednym–dwoma zdaniami: jaki problem rozwiązuje aplikacja i dla kogo.>

## 2. Użytkownicy i role

<Kto korzysta z aplikacji? Czy są role (np. admin, czytelnik)? Czy potrzebne jest logowanie?>

## 3. Encje (dane)

<Każda encja = jedna tabela w bazie i jeden zestaw plików (validation/actions/queries/components/page).
Podaj pola, typy, czy są wymagane, wartości enumów i relacje. Skopiuj tabelę dla każdej encji.>

### <NazwaEncji>

| Pole | Typ | Wymagane | Uwagi |
| ---- | --- | -------- | ----- |
|      |     |          |       |

Relacje: <np. Project ma wiele Task; Task należy do jednego Project>

## 4. Strony i widoki

<Jakie strony mają być w nawigacji i co pokazują (lista, szczegóły, wykres, dashboard).>

## 5. Funkcje AI (opcjonalnie)

<Co ma robić AI? Np. generowanie opisów, klasyfikacja, podsumowania. Modele są w src/lib/ai.ts.>

## 6. Poza zakresem

<Czego świadomie NIE robimy w tej wersji (np. logowanie, wielojęzyczność, eksport).>

## 7. Otwarte pytania

<Rzeczy do ustalenia przed lub w trakcie budowy.>
