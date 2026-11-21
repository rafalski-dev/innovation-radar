# Opis projektu: Radar innowacji

> Projekt na hackathon PCI. Wytyczne organizatorów: [`CHALLENGE.md`](CHALLENGE.md).
> Claude czyta ten plik na początku każdego zadania, a `/start-project` buduje z niego plan encji.
> Szkic przygotowany na podstawie wytycznych. Pozycje oznaczone **(propozycja)** czekają na decyzję
> zespołu (patrz sekcja 7).

## 1. Cel

Platforma, która prowadzi innowację z instytucji publicznej (szkoła, uczelnia, samorząd) przez cały
proces: **zgłoszenie → uporządkowanie → ocena według jawnych kryteriów → rekomendacja ścieżki →
połączenie z partnerami**. Dzięki temu lokalne pomysły nie giną w jednej organizacji, a podobne
rozwiązania nie są tworzone od nowa w kilku miejscach.

Pętla demo (scenariusz z wytycznych, sekcja 6):

1. Zgłoszenie innowacji (formularz lub wklejony tekst, który AI zamienia w ustrukturyzowaną kartę).
2. Karta innowacji: problem, rozwiązanie, typ, etap, twórcy, instytucja.
3. Ocena potencjału: punkty w 5 kryteriach, ważona suma, uzasadnienie.
4. Rekomendacja ścieżki + dopasowani partnerzy + podobne innowacje (ryzyko dublowania).
5. Uzasadnienie rekomendacji i mierniki skuteczności (co sprawdzić za 3–6 miesięcy).

Demo na **co najmniej dwóch przypadkach**, np. aplikacja edukacyjna ze szkoły (innowacja
edukacyjna) i proces e-obsługi z gminy (innowacja procesowa).

## 2. Użytkownicy i role

Logowanie: **Better Auth** (e-mail + hasło), sesje w bazie przez adapter Prismy. Rola wybierana
przy rejestracji, zapisana w polu `role` użytkownika (enum `UserRole`):

| Rola (`UserRole`) | Etykieta PL          | Co robi                                                      | Etap 1  |
| ----------------- | -------------------- | ------------------------------------------------------------ | ------- |
| `USER`            | Użytkownik           | osoba prywatna; zgłasza pomysły (tickety), śledzi ich status | tak     |
| `OFFICIAL`        | Urzędnik             | sprawdza i ocenia tickety, prowadzi je przez statusy         | później |
| `BUSINESS`        | Reprezentant biznesu | zgłasza zapotrzebowanie, szuka gotowych rozwiązań            | później |

W etapie 1 rozwijamy tylko `USER`. Pozostałe role są w schemacie i na liście przy rejestracji
(oznaczone „wkrótce”, nieaktywne), żeby później nie przebudowywać bazy.

Widoczność ticketów: **do ustalenia** (pytanie 2 w sekcji 7). Tymczasowo dashboard pokazuje
tickety zalogowanego użytkownika; filtr trzymamy w jednym miejscu (`src/queries/innovation.ts`),
żeby łatwo go zmienić.

## Etap 1 (zrobiony)

1. `src/lib/site.ts`: nazwa „Radar innowacji”, opis, nawigacja.
2. Strona główna `/`: hasło, 4 kroki procesu (Zgłoś → Ocena → Rekomendacja → Partner),
   przyciski „Załóż konto” i „Zaloguj się”.
3. Better Auth: `/register` (imię, e-mail, hasło, rola), `/login`, wylogowanie w nagłówku,
   `/dashboard` tylko dla zalogowanych.
4. `/dashboard` w stylu Jira: tablica z kolumnami statusów, karty ticketów (klucz `RI-1`,
   tytuł, typ), przycisk „+ Nowy pomysł” z formularzem tworzącym `Innovation`.
5. Usunięcie encji wzorcowej `item`.

Stan po etapie 1:

- Better Auth (e-mail + hasło, adapter Prismy), `src/lib/auth.ts`, `auth-client.ts`, `session.ts`.
  Rola ustawiana przez serwer na `USER` (klient nie może jej nadać); OFFICIAL/BUSINESS widoczne
  w rejestracji jako „wkrótce”. Zmienne: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
- `Innovation` bez `institutionId` (reszta pól wg sekcji 3). Akcje biorą `authorId` z sesji.
  Filtr widoczności (tylko własne tickety) jest w jednym miejscu: `visibleWhere()` w
  `src/queries/innovation.ts`.
- `/dashboard` (tablica statusów, formularz „Nowy pomysł”) i `/dashboard/[number]` (szczegóły).
  Numer `RI-n` jest globalny (autoincrement), więc u danego użytkownika nie musi zaczynać się od 1.
- Seed: konto demo `demo@radar-innowacji.pl` (hasło w `prisma/seed.ts`) + 4 tickety.
- Brak: edycja/usuwanie ticketów, zmiana statusu, drag & drop (wymaga nowej paczki).

## Etap 2 (zrobione: sidebar, Moje pomysły, Zespoły, Profil; później: widoki OFFICIAL i BUSINESS)

Nawigacja dashboardu: boczny panel (sidebar) w `/dashboard`, pozycje zależne od `role`.
Górny nagłówek zostaje na linki publiczne, konto i wylogowanie.

| Sekcja          | Ścieżka              | Kto      | Zawartość                                           |
| --------------- | -------------------- | -------- | --------------------------------------------------- |
| Tablica         | `/dashboard`         | wszyscy  | tablica statusów                                    |
| Moje pomysły    | `/dashboard/ideas`   | USER     | lista, edycja i usuwanie (tylko status „Zgłoszone”) |
| Zespoły         | `/dashboard/teams`   | USER     | tworzenie zespołu, członkowie (po e-mailu), pomysły |
| Profil          | `/dashboard/profile` | wszyscy  | edycja danych, zmiana hasła                         |
| Do oceny        | `/dashboard/review`  | OFFICIAL | później                                             |
| Zapotrzebowania | `/dashboard/needs`   | BUSINESS | później                                             |

Decyzje (propozycje, do zmiany): zespół = współautorzy pomysłu (nie instytucja); jest właściciel
i członkowie; zespół widzi i edytuje wspólnie pomysły przypisane do zespołu; pomysł można
edytować i usuwać tylko w statusie „Zgłoszone”. Widoczność ticketów: własne + zespołów, których
użytkownik jest członkiem.

## 3. Encje (dane)

Kolejność budowy: `Institution` → `Partner` → `Innovation` → `Assessment` → `Match`.

### Institution (instytucja źródłowa)

| Pole    | Typ    | Wymagane | Uwagi                                                      |
| ------- | ------ | -------- | ---------------------------------------------------------- |
| name    | string | tak      | 2–150 znaków                                               |
| type    | enum   | tak      | SCHOOL, UNIVERSITY, LOCAL_GOVERNMENT, PUBLIC_OTHER         |
| city    | string | nie      |                                                            |
| region  | string | nie      | domyślnie „podkarpackie”, ale aplikacja działa dla każdego |
| website | string | nie      | URL                                                        |

### Partner (potencjalny odbiorca, partner, inwestor)

| Pole         | Typ    | Wymagane | Uwagi                                                               |
| ------------ | ------ | -------- | ------------------------------------------------------------------- |
| name         | string | tak      |                                                                     |
| type         | enum   | tak      | COMPANY, INVESTOR, ACCELERATOR, PUBLIC_INSTITUTION, UNIVERSITY, NGO |
| interests    | text   | tak      | czego szuka (sektory, problemy); podstawa dopasowania               |
| sectors      | enum[] | nie      | te same wartości co `Innovation.sector`                             |
| contactName  | string | nie      |                                                                     |
| contactEmail | string | nie      | e-mail                                                              |

### Innovation (innowacja)

| Pole          | Typ    | Wymagane | Uwagi                                                                                           |
| ------------- | ------ | -------- | ----------------------------------------------------------------------------------------------- |
| title         | string | tak      | 3–150 znaków                                                                                    |
| summary       | text   | tak      | 1–3 zdania                                                                                      |
| problem       | text   | tak      | jaki problem rozwiązuje                                                                         |
| solution      | text   | tak      | na czym polega rozwiązanie                                                                      |
| type          | enum   | tak      | TECHNOLOGICAL, ORGANIZATIONAL, EDUCATIONAL, SOCIAL, PROCESS (wytyczne, sekcja 1)                |
| stage         | enum   | tak      | IDEA, PROTOTYPE, PILOT, IMPLEMENTED, SCALED                                                     |
| sector        | enum   | nie      | EDUCATION, HEALTH_QUALITY_OF_LIFE, ICT, MOBILITY, AEROSPACE, ENVIRONMENT, ADMINISTRATION, OTHER |
| status        | enum   | tak      | SUBMITTED, ASSESSED, RECOMMENDED, MATCHED, ARCHIVED (pipeline; domyślnie SUBMITTED)             |
| source        | enum   | tak      | MANUAL, AI_EXTRACTED, IMPORTED (skąd pochodzi wpis; domyślnie MANUAL)                           |
| sourceUrl     | string | nie      | link do źródła (artykuł, baza patentowa, strona instytucji)                                     |
| creators      | text   | nie      | twórcy (imiona/role)                                                                            |
| contactEmail  | string | nie      | e-mail                                                                                          |
| number        | int    | tak      | autoincrement; klucz w UI to `RI-<number>` (jak w Jirze)                                        |
| authorId      | FK     | tak      | → User (Better Auth); autor zgłoszenia                                                          |
| institutionId | FK     | nie      | → Institution (opcjonalne: osoba prywatna nie musi mieć instytucji; etap 2)                     |

### Assessment (ocena potencjału)

Jawne kryteria, skala 1–5. Wagi trzymamy w `src/validation/assessment.ts` i pokazujemy na stronie
„Metodologia” (wymóg przejrzystości, wytyczne sekcja 5).

| Pole            | Typ     | Wymagane | Uwagi                                                               |
| --------------- | ------- | -------- | ------------------------------------------------------------------- |
| novelty         | int 1–5 | tak      | nowość / oryginalność                                               |
| impact          | int 1–5 | tak      | skala problemu i korzyści dla użytkowników                          |
| maturity        | int 1–5 | tak      | dojrzałość (od pomysłu do wdrożenia, uproszczony TRL)               |
| transferability | int 1–5 | tak      | czy da się przenieść do innych instytucji                           |
| feasibility     | int 1–5 | tak      | koszt i trudność wdrożenia (5 = łatwo, tanio)                       |
| totalScore      | float   | tak      | ważona suma 0–100, liczona na serwerze                              |
| recommendedPath | enum    | tak      | DEVELOP, TRANSFER, COMMERCIALIZE, IMPLEMENT_ELSEWHERE, SEEK_FUNDING |
| rationale       | text    | tak      | uzasadnienie oceny i ścieżki                                        |
| successMetrics  | text    | nie      | mierniki skuteczności (np. „3 szkoły wdrożą w 6 mies.”)             |
| aiGenerated     | bool    | tak      | czy ocena to propozycja AI (domyślnie false)                        |
| innovationId    | FK      | tak      | → Innovation                                                        |

### Match (dopasowanie innowacja–partner)

| Pole         | Typ       | Wymagane | Uwagi                                            |
| ------------ | --------- | -------- | ------------------------------------------------ |
| innovationId | FK        | tak      | → Innovation                                     |
| partnerId    | FK        | tak      | → Partner                                        |
| fitScore     | int 0–100 | nie      | dopasowanie (AI lub ręcznie)                     |
| reason       | text      | tak      | dlaczego ten partner                             |
| status       | enum      | tak      | SUGGESTED, CONTACTED, IN_TALKS, AGREED, REJECTED |

Relacje:

- Institution ma wiele Innovation; Innovation należy do jednej Institution.
- Innovation ma wiele Assessment (historia ocen; na karcie pokazujemy najnowszą).
- Innovation ↔ Partner przez Match (unikalna para `innovationId` + `partnerId`).

## 4. Strony i widoki

Inspiracja UI: **Jira**. Innowacje jak zgłoszenia (issues): tablica z kolumnami statusów,
karty z kluczem i oceną, szczegóły w panelu bocznym. Zakres do potwierdzenia z planem zespołu.

| Ścieżka            | W nawigacji | Co pokazuje                                                                                              |
| ------------------ | ----------- | -------------------------------------------------------------------------------------------------------- |
| `/`                | Start       | Dashboard „radar”: liczba innowacji w każdym statusie, top wg wyniku, ostatnie zgłoszenia                |
| `/innovation`      | Innowacje   | Lista z filtrami (typ, etap, sektor, status), wynik, instytucja; przycisk „Zgłoś”                        |
| `/innovation/[id]` | nie         | Karta innowacji: dane, ocena (kryteria + uzasadnienie), ścieżka, dopasowani partnerzy, podobne innowacje |
| `/institution`     | Instytucje  | CRUD instytucji                                                                                          |
| `/partner`         | Partnerzy   | CRUD partnerów                                                                                           |
| `/methodology`     | Metodologia | Kryteria, wagi, skala, zasady rekomendacji, źródła danych i ograniczenia AI                              |

## 5. Funkcje AI

Modele w `src/lib/ai.ts`. Każda funkcja AI zwraca **propozycję**, którą człowiek zatwierdza lub
poprawia. W UI zawsze widać, co pochodzi od AI.

1. **Strukturyzacja zgłoszenia**: z wklejonego tekstu (opis, notatka, artykuł) wypełnia pola
   `Innovation` (`generateObject` + schemat Zod).
2. **Propozycja oceny**: punkty 1–5 w każdym kryterium + uzasadnienie + ścieżka + mierniki.
   Wynik ważony zawsze liczy kod, nie model.
3. **Dopasowanie partnerów**: na podstawie innowacji i pola `interests` partnerów proponuje Match
   z `fitScore` i `reason`.
4. **Podobne innowacje**: wskazuje istniejące wpisy o podobnym problemie lub rozwiązaniu
   (ograniczenie dublowania). **(propozycja)** na start: LLM porównuje tytuły i streszczenia
   z bazy; embeddingi później.

Źródła danych i ograniczenia (wymóg wytycznych, sekcja 5) opisujemy na stronie „Metodologia”.
Bazy z wytycznych (UPRP, EPO, PBN, Interreg, NCBiR) to kierunek „automatycznego wykrywania”.
W prototypie **(propozycja)** pokazujemy import pojedynczego wpisu z linku (`source = IMPORTED`),
bez masowego scrapowania.

## 6. Poza zakresem

- Widoki ról `OFFICIAL` i `BUSINESS` (etap 2+).
- Weryfikacja e-mail, reset hasła, logowanie przez Google.
- Masowe, automatyczne pobieranie danych z baz patentowych i naukowych.
- Powiadomienia e-mail i komunikacja z partnerami w aplikacji.
- Wielojęzyczność (UI po polsku).
- Encja wzorcowa `item`: do usunięcia po zbudowaniu pierwszej własnej encji.

## 7. Otwarte pytania

Ustalone:

- Wagi kryteriów: **równe, po 20%**.
- Model AI: **Anthropic**.
- Nazwa aplikacji: **Radar innowacji**.
- Logowanie: **Better Auth**, 3 role (`USER`, `OFFICIAL`, `BUSINESS`); w etapie 1 tylko `USER`.
- UI dashboardu inspirowany **Jirą**.

Do ustalenia:

1. Podobne innowacje: porównanie przez LLM czy embeddingi (pgvector w Neonie, może wymagać nowej
   paczki)?
2. Widoczność ticketów: każdy widzi tylko swoje czy wszyscy widzą wszystkie?
3. Dokładny plan aplikacji i dane demo: zespół przesyła własny plan; po nim aktualizujemy encje
   i strony w tym pliku.
