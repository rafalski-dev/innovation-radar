# Agent wyszukujący innowacje: specyfikacja

> Plan działania agenta, który dla projektu firmy (encja `Need`) szuka innowacji w polskich źródłach,
> ocenia je i rekomenduje kontakt. Powiązane: [`PROJECT.md`](PROJECT.md), wytyczne [`CHALLENGE.md`](CHALLENGE.md)
> (scenariusz demo a–e, sekcja 6). Status: **projekt, do akceptacji**.

## Przepływ w skrócie

```
Projekt firmy (Need: tytuł, opis, link, PDF)
  │  użytkownik klika „Szukaj innowacji”
  ▼
KROK 1  Profil wyszukiwania (AI)          → słowa kluczowe, zapytania, czego nie szukamy
  │  użytkownik przegląda i poprawia profil, klika „Uruchom agenta”
  ▼
KROK 2  Agent przeszukuje źródła (AI + web search + web fetch, tylko polskie domeny)
  ▼
KROK 3  Kandydaci: porządkowanie i usuwanie duplikatów (kod)
  ▼
KROK 4  Ocena każdego kandydata wg 5 jawnych kryteriów (AI ocenia, kod liczy wynik)
  ▼
KROK 5  Rekomendacja: ścieżka współpracy, kontakt, następne kroki, mierniki (AI)
  ▼
KROK 6  Wyniki na ekranie: ranking, uzasadnienia, linki do źródeł
```

Mapowanie na scenariusz demo z wytycznych: krok 1–2 = (a) wykrycie, krok 3 = (b) uporządkowanie,
krok 4 = (c) ocena, krok 5 = (d) wskazanie partnerów/ścieżek, krok 5–6 = (e) uzasadnienie i mierniki.

---

## Krok 0. Źródła (konfiguracja, raz)

Lista domen, po których wolno szukać agentowi. Trzymana w bazie (encja `Source`), żeby nowe źródło
dodać bez zmiany kodu (argument „skalowalność” dla jury).

| Źródło            | Domena (`allowed_domains`) | Co daje                                     |
| ----------------- | -------------------------- | ------------------------------------------- |
| NCBiR             | `gov.pl/web/ncbr`          | projekty B+R, sukcesy beneficjentów          |
| Mapa Dotacji UE   | `mapadotacji.gov.pl`       | projekty z funduszy UE (kto, gdzie, za ile)  |
| RAD-on            | `radon.nauka.gov.pl`       | patenty, projekty i instytucje naukowe       |
| Interreg          | `interreg.gov.pl`          | projekty współpracy regionów                 |
| Czasopisma PAN    | `czasopisma.pan.pl`        | publikacje naukowe (do przetestowania)       |
| PPM               | `ppm.edu.pl`               | repozytorium publikacji (do przetestowania)  |

Pomijamy na start: UPRP i PBN (słabo indeksowane przez wyszukiwarkę; w prezentacji jako rozwój przez API).

## Krok 1. Profil wyszukiwania

**Kiedy:** użytkownik klika „Szukaj innowacji” przy projekcie (lub na stronie Wyszukiwania wybiera projekt).

**Wejście:** `Need.title`, `Need.description`, `Need.linkUrl`, pliki PDF z `NeedFile` (Claude czyta PDF bezpośrednio).

**Jak:** jedno wywołanie modelu z wymuszonym formatem odpowiedzi (`generateObject` + schemat Zod).
Bez wyszukiwania w internecie. Koszt: grosze.

**Wyjście (zapisywane w `Search.profile`):**

| Pole            | Opis                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------- |
| `problem`       | problem w 1 zdaniu                                                                         |
| `keywordsPl`    | 5–10 słów/fraz kluczowych po polsku                                                        |
| `synonyms`      | synonimy i warianty                                                                        |
| `keywordsEn`    | odpowiedniki po angielsku (publikacje i RAD-on często mają angielskie opisy)               |
| `domain`        | dziedzina (np. środowisko, edukacja, ICT)                                                  |
| `innovationTypes` | jakich typów innowacji szukamy: technologiczna, organizacyjna, edukacyjna, społeczna, procesowa |
| `queries`       | 3–5 gotowych zapytań do wyszukiwarki                                                       |
| `exclusions`    | czego NIE szukamy (do odsiewania wyników)                                                  |

**Ekran:** profil jako edytowalne „chipsy” (dodaj/usuń słowo, popraw zapytanie) + przycisk
„Uruchom agenta”. Użytkownik kontroluje AI, zanim wydamy pieniądze na wyszukiwanie.

## Krok 2. Agent przeszukuje źródła

**Kiedy:** użytkownik zatwierdza profil.

**Jak:** jedno wywołanie Claude (Sonnet 5.5) z dwoma narzędziami po stronie Anthropic:

- **web search** z `allowed_domains` = aktywne źródła z kroku 0, `max_uses` ≈ 6;
- **web fetch** (czytanie całej strony wyniku), `max_uses` ≈ 5.

Instrukcja dla agenta (prompt systemowy, w skrócie):

1. Zacznij od zapytań z profilu.
2. Jeśli wyniki są słabe lub puste, zmień zapytanie (synonimy, angielski, węższa/szersza fraza).
3. Obiecujące wyniki otwórz (web fetch) i wyciągnij szczegóły: kto, gdzie, kiedy, stan rozwoju.
4. Odrzuć to, co pasuje do `exclusions`.
5. Zwróć listę 5–10 kandydatów w ustalonym formacie (krok 3). Nie wymyślaj danych: jeśli czegoś nie
   ma w źródle, zostaw pole puste. Każdy kandydat musi mieć link do źródła.

**Czas:** 30–120 s. Na ekranie status („Szukam w Mapie Dotacji…”), a wynik zapisujemy w bazie.
Uwaga techniczna: długie wywołanie na Vercelu wymaga ustawienia czasu funkcji (`maxDuration`)
albo uruchomienia w tle i odświeżania statusu. Sesja od kodu sprawdza aktualne możliwości Next 16 / Vercel.

**Koszt (szacunek):** ok. $0,40 (≈1,6 zł) na Sonnecie. Rzeczywisty koszt zapisujemy z odpowiedzi API.

## Krok 3. Kandydaci: porządkowanie

Każdy kandydat to wiersz `SearchResult`:

| Pole            | Opis                                                        |
| --------------- | ----------------------------------------------------------- |
| `title`         | nazwa rozwiązania/projektu                                   |
| `summary`       | 2–3 zdania: co to jest i co rozwiązuje                       |
| `organization`  | kto to zrobił (firma, uczelnia, gmina, szkoła)               |
| `location`      | miasto/region, jeśli podane                                  |
| `year`          | rok, jeśli podany                                            |
| `innovationType`| typ innowacji (jak w profilu)                                |
| `maturity`      | etap: pomysł / prototyp / pilotaż / wdrożone                  |
| `sourceUrl`     | link do źródła (wymagany)                                    |
| `sourceName`    | nazwa źródła (np. „Mapa Dotacji UE”)                          |

Kod usuwa duplikaty (ten sam `sourceUrl` lub ta sama nazwa + organizacja).

## Krok 4. Ocena według jawnych kryteriów

AI ocenia każdego kandydata w skali 1–5 i podaje 1 zdanie uzasadnienia do każdej oceny.
**Wynik końcowy liczy kod**, nie model (powtarzalność i przejrzystość).

| Kryterium         | Pytanie                                                       | Waga |
| ----------------- | ------------------------------------------------------------- | ---- |
| Dopasowanie       | Na ile rozwiązuje problem z projektu?                          | 20%  |
| Dojrzałość        | Czy działa / jest wdrożone, czy to dopiero pomysł?             | 20%  |
| Przenaszalność    | Czy da się je przenieść do firmy/instytucji z projektu?        | 20%  |
| Wykonalność       | Koszt i trudność wdrożenia (5 = łatwo, tanio)                   | 20%  |
| Nowość            | Na ile nowatorskie w porównaniu z typowymi rozwiązaniami?      | 20%  |

`score = (suma ocen − 5) / 20 × 100` → 0–100. Kryteria i wagi opisane na stronie „Metodologia”.

Może to być osobne, tańsze wywołanie modelu (structured output) po kroku 2, dzięki czemu oceny są spójne.

## Krok 5. Rekomendacja

Dla kandydatów z wynikiem ≥ 60 (do ustalenia):

| Pole              | Opis                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| `path`            | ścieżka: LICENSE (licencja/transfer technologii), PARTNERSHIP (wspólny projekt B+R), PURCHASE (zakup/wdrożenie), JOINT_GRANT (wspólny wniosek o grant), INSPIRATION (wzorzec do powtórzenia) |
| `why`             | uzasadnienie w 2–3 zdaniach                                                                        |
| `contact`         | do kogo się zwrócić (organizacja, strona/kontakt ze źródła, jeśli publiczny)                       |
| `nextSteps`       | 2–3 konkretne kroki                                                                                |
| `successMetrics`  | mierniki skuteczności (np. „pilotaż w 2 szkołach w 6 mies.”)                                       |

## Krok 6. Wyniki na ekranie

- Lista kandydatów posortowana wg wyniku (badge 0–100, kolor).
- Rozwinięcie: oceny w 5 kryteriach z uzasadnieniem, rekomendacja, link do źródła.
- U góry: profil wyszukiwania, liczba przeszukanych źródeł, czas i koszt wyszukiwania.
- Brak wyników: komunikat + propozycja poszerzenia profilu (powrót do kroku 1).
- Ponowne otwarcie wyszukiwania czyta wyniki z bazy (nic nie kosztuje).

---

## Zmiany w bazie (propozycja)

- `Source`: `name`, `domain`, `description`, `enabled`.
- `Search` (rozszerzenie istniejącej): `status` (`DRAFT` → `PROFILE_READY` → `RUNNING` → `DONE` / `FAILED`),
  `profile` (JSON z kroku 1), `error`, `inputTokens`, `outputTokens`, `webSearches`, `costUsd`, `durationMs`.
- `SearchResult`: pola z kroków 3–5 + `searchId`; oceny jako osobne kolumny `fit`, `maturity`,
  `transferability`, `feasibility`, `novelty` + `score` + uzasadnienia (JSON).

## Bezpieczeństwo kosztów i jakości

- `max_uses` dla web search i web fetch w każdym wywołaniu.
- Limit wydatków w Anthropic Console (np. $50/mies.).
- Wyniki zawsze z linkiem do źródła; agent nie wymyśla danych (instrukcja + odrzucanie kandydatów bez URL).
- Ograniczenia do opisania w prezentacji: tylko strony zaindeksowane w wyszukiwarce, wyniki mogą się
  różnić między uruchomieniami, ocena AI to propozycja (człowiek decyduje).

## Kolejność budowy

1. **Skrypt testowy** (`scripts/agent-test.ts`): dla przykładowego projektu odpala kroki 1–2 i wypisuje
   kandydatów, liczbę wyszukiwań, tokeny i koszt. Cel: sprawdzić jakość wyników i realny koszt, zanim
   zbudujemy UI.
2. Krok 1 w aplikacji: profil + edycja.
3. Krok 2–3: agent + zapis kandydatów + status.
4. Krok 4–5: ocena i rekomendacja.
5. Krok 6: ekran wyników, strona „Metodologia”.
6. Dwa przypadki demo (wymóg wytycznych), np. gmina (smog przy szkołach) i firma produkcyjna.

## Do decyzji

1. Czy użytkownik przegląda i poprawia profil przed uruchomieniem agenta? **Propozycja: tak.**
2. Model agenta: Sonnet 5.5 (propozycja) czy Opus 5.5 / Haiku 5.5 (do porównania w skrypcie testowym).
3. Próg wyniku dla rekomendacji (propozycja: 60/100).
