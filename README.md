# Radar innowacji

Projekt hackathonowy PCI. Platforma dla firm i instytucji, które szukają gotowych rozwiązań i partnerów
dla swoich problemów. Użytkownik opisuje problem, a agent AI przeszukuje polskie i europejskie bazy
(UPRP, EPO, PBN/PPM/BazTech, Interreg, NCBiR), ocenia znalezione materiały i uzasadnia dopasowanie.

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
- **Wyszukiwanie** (`Dashboard → Wyszukiwanie → Nowe wyszukiwanie`): wybór projektu i zapis zapytania do historii.

## Cel prototypu

Zaprezentować działający prototyp z jak największą liczbą funkcji z planu. Status funkcji:

| #   | Funkcja                                                                             | Status      |
| --- | ----------------------------------------------------------------------------------- | ----------- |
| 1   | Panel rejestracji organizacji i użytkowników                                        | gotowe      |
| 2   | Asystent formułowania problematyki badawczej                                        | w budowie   |
| 3   | Rekomendacje rozbicia problemów na aspekty                                          | w budowie   |
| 4   | Rekomendacje rozbicia aspektów na proponowane wyszukania w bazach źródeł            | w budowie   |
| 5   | Moduł dodawania źródeł do wyszukiwań                                                | planowane   |
| 6   | Ocena przydatności materiałów w kontekście wyszukiwań                               | planowane   |
| 7   | Zautomatyzowany raport dla problemu (aspekty, wyszukiwania, wybrane źródła)         | planowane   |
| 8   | Dzielenie się wynikami z innymi podmiotami i kontakt w celu konsultacji             | planowane   |
| 9   | Alerty o nowych materiałach pasujących do zapytania                                 | planowane   |
| 10  | Własny zbiór opracowań (zapis analiz AI, bez ponownej weryfikacji tego samego materiału) | planowane   |
| 11  | Regularne wypuszczanie nowych wersji                                                | w trakcie   |

Szczegóły: [`docs/PROJECT.md`](docs/PROJECT.md), plan agenta wyszukującego: [`docs/AGENT.md`](docs/AGENT.md),
wytyczne organizatorów: [`docs/CHALLENGE.md`](docs/CHALLENGE.md).

## Stack

Next.js 16 (App Router) · Prisma 7 + Neon (Postgres) · Better Auth · Zod 4 · React Hook Form ·
shadcn (Base UI) · Tailwind 4 · AI SDK (Anthropic) · Cloudflare R2 (pliki PDF) · Vercel.

## Uruchomienie lokalne

1. `npm install` (generuje też klienta Prismy).
2. Skopiuj `.env.example` do `.env` i uzupełnij: `DATABASE_URL` (Neon), `BETTER_AUTH_SECRET`
   (`openssl rand -base64 32`), `BETTER_AUTH_URL` (`http://localhost:3000`), opcjonalnie `ANTHROPIC_API_KEY`
   i zmienne `R2_*` (pliki PDF).
3. `npm run db:push` tworzy tabele, a `npm run db:seed` wczytuje dane testowe (opcjonalnie).
4. `npm run dev` → http://localhost:3000

Skrypty: `dev`, `typecheck`, `lint`, `format`, `db:push`, `db:seed`, `db:studio`. Zasady kodu: [`CLAUDE.md`](CLAUDE.md).
