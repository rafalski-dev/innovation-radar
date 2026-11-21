# Starter: Next.js + Prisma + shadcn

Uniwersalny starter aplikacji CRUD z AI. Stack: Next.js 16 (App Router) · Prisma 7 + Neon (Postgres) ·
Zod 4 · React Hook Form · shadcn (Base UI) · Tailwind 4 · AI SDK (Anthropic, Groq).

Repo nie jest związane z żadną dziedziną. Konkretny projekt opisujesz w [`docs/PROJECT.md`](docs/PROJECT.md),
a encja `item` to tylko przykład wzorca CRUD.

## Uruchomienie

1. Zainstaluj zależności: `npm install` (generuje też klienta Prismy).
2. Skopiuj `.env.example` do `.env` i uzupełnij:
   - `DATABASE_URL`: connection string z [Neon](https://console.neon.tech),
   - `ANTHROPIC_API_KEY`, `GROQ_API_KEY`: tylko jeśli używasz funkcji AI.
3. Utwórz tabele: `npm run db:push`
4. (Opcjonalnie) dane testowe: `npm run db:seed`
5. Start: `npm run dev` → http://localhost:3000

## Nowy projekt z tego startera

1. Skopiuj repo (albo oznacz je na GitHubie jako _Template repository_).
2. Wypełnij [`docs/PROJECT.md`](docs/PROJECT.md): cel, encje z polami, strony, funkcje AI.
3. Zmień nazwę i nawigację w [`src/lib/site.ts`](src/lib/site.ts).
4. Uruchom Claude Code i wpisz `/start-project`. Claude sprawdzi opis, zaproponuje plan encji
   i po akceptacji zbuduje je według wzorca.
5. Pojedyncza encja: `/new-feature <encja>`.
6. Encja wzorcowa `item`: zostaw ją, dopóki nie zbudujesz pierwszej własnej encji, potem usuń
   `src/{validation,actions,queries}/item.ts`, `src/components/item/`, `src/app/item/`,
   model i enumy z `prisma/schema.prisma`, wpis w `site.nav` oraz dane w `prisma/seed.ts`.

## Skrypty

| Skrypt              | Co robi                                        |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | serwer deweloperski                            |
| `npm run typecheck` | sprawdzenie typów (wymagane na koniec zadania) |
| `npm run lint`      | ESLint                                         |
| `npm run format`    | Prettier (formatuje cały projekt)              |
| `npm run db:push`   | synchronizuje `prisma/schema.prisma` z bazą    |
| `npm run db:seed`   | dane testowe z `prisma/seed.ts`                |
| `npm run db:studio` | podgląd bazy w przeglądarce                    |

## Struktura

Zasady i struktura plików dla Claude: [`CLAUDE.md`](CLAUDE.md).
# innovation-radar
