# Radar innowacji

Projekt hackathonowy PCI. Platforma dla firm i instytucji, które szukają gotowych rozwiązań i partnerów
dla swoich problemów. Użytkownik opisuje problem, AI proponuje frazy do wyszukiwarki, a agent przeszukuje
publiczne bazy i pokazuje listę wyników z uzasadnieniem i linkiem do źródła. Obecnie agent przeszukuje
NCBiR i RAD-on, a kolejne bazy (UPRP, EPO, PBN/PPM/BazTech, Interreg) są w planie.

## Dla jury: jak wypróbować

1. Wejdź na działający prototyp: **https://innovation-radar-three.vercel.app/**
2. Zaloguj się kontem testowym:

   | Pole   | Wartość          |
   | ------ | ---------------- |
   | E-mail | `test@gmail.com` |
   | Hasło  | `Mini12345!`     |

3. Możesz też założyć własne konto (rejestracja na stronie głównej).

Co sprawdzić po zalogowaniu:

- **Organizacje** (`Dashboard → Organizacje`): dodanie firmy (NIP, adres, branża), dodanie osób do organizacji.
- **Projekty**: opis problemu firmy, opcjonalny link i pliki PDF (do 3, każdy do 20 MB).
- **Aspekt** (`Dashboard → Aspekty → Nowy aspekt`):
  1. wybierz projekt i kliknij „Generuj frazy” (3–5 fraz po polsku), popraw je i zatwierdź,
  2. kliknij „Szukaj w źródłach” (do minuty): agent pokaże do 3 wyników z linkami do źródeł,
  3. jeśli lista jest dobra, kliknij „Zatwierdź aspekt”. Zapisze się w historii razem z frazami.

## Cel prototypu

Zaprezentować działający prototyp z jak największą liczbą funkcji z planu. Status funkcji:

| #   | Funkcja                                                             | Status    | Co jest w prototypie                                                                                                                     |
| --- | ------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Panel rejestracji organizacji i użytkowników                        | gotowe    | konta, organizacje (NIP, adres), osoby w organizacji, projekty z linkiem i PDF                                                           |
| 2   | Asystent formułowania problematyki badawczej                        | częściowo | AI wnioskuje frazy z opisu projektu (bez czatu z pytaniami pomocniczymi)                                                                 |
| 3   | Rekomendacje rozbicia problemów na aspekty                          | planowane | brak podziału na aspekty                                                                                                                 |
| 4   | Rekomendacje rozbicia aspektów na proponowane wyszukania w bazach   | częściowo | 3–5 fraz do wyszukiwania, edytowalne i zatwierdzane przez użytkownika                                                                    |
| 5   | Moduł dodawania źródeł do wyszukiwań                                | częściowo | agent przeszukuje NCBiR i RAD-on; lista źródeł jest w kodzie, bez modułu w aplikacji                                                     |
| 6   | Ocena przydatności materiałów w kontekście wyszukiwań               | częściowo | każdy wynik ma uzasadnienie „dlaczego pasuje” (bez oceny punktowej)                                                                      |
| 7   | Zautomatyzowany raport dla problemu (aspekty, wyszukiwania, źródła) | planowane | brak                                                                                                                                     |
| 8   | Dzielenie się wynikami z innymi podmiotami i kontakt w konsultacji  | planowane | osoby w organizacji współdzielą projekty, wyniki nie są jeszcze udostępniane                                                             |
| 9   | Alerty o nowych materiałach pasujących do zapytania                 | planowane | brak                                                                                                                                     |
| 10  | Własny zbiór opracowań (zapis analiz AI, bez ponownej weryfikacji)  | częściowo | zatwierdzone aspekty z wynikami zapisują się w historii, a te same frazy dla tego projektu wracają z zapisu (7 dni) bez ponownego kosztu |
| 11  | Regularne wypuszczanie nowych wersji                                | w trakcie | wdrożenie z gałęzi `main` na Vercel po każdej zmianie                                                                                    |

**Ograniczenia agenta (kontrola kosztów):** model Claude Haiku, do 3 wyszukiwań i 3 wyników na uruchomienie,
5 uruchomień na 30 minut na użytkownika. Wyniki pochodzą z wyszukiwarki ograniczonej do wskazanych domen,
a link każdego wyniku pochodzi z faktycznych wyników wyszukiwania. Ocena AI to propozycja, decyduje człowiek.

Szczegóły: [`docs/PROJECT.md`](docs/PROJECT.md), plan agenta wyszukującego: [`docs/AGENT.md`](docs/AGENT.md),
wytyczne organizatorów: [`docs/CHALLENGE.md`](docs/CHALLENGE.md).

## Stack

Next.js 16 (App Router) · Prisma 7 + Neon (Postgres) · Better Auth · Zod 4 · React Hook Form ·
shadcn (Base UI) · Tailwind 4 · Claude API (Anthropic, Haiku) · Cloudflare R2 (pliki PDF) · Vercel.

## Uruchomienie lokalne

1. `npm install` (generuje też klienta Prismy).
2. Skopiuj `.env.example` do `.env` i uzupełnij: `DATABASE_URL` (Neon), `BETTER_AUTH_SECRET`
   (`openssl rand -base64 32`), `BETTER_AUTH_URL` (`http://localhost:3000`), opcjonalnie `ANTHROPIC_API_KEY`
   i zmienne `R2_*` (pliki PDF).
3. `npm run db:push` tworzy tabele, a `npm run db:seed` wczytuje dane testowe (opcjonalnie).
4. `npm run dev` → http://localhost:3000

Skrypty: `dev`, `typecheck`, `lint`, `format`, `db:push`, `db:seed`, `db:studio`. Zasady kodu: [`CLAUDE.md`](CLAUDE.md).
