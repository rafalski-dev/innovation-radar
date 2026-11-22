# Starter: Next.js + Prisma + shadcn

Next.js 16 App Router · Prisma 7 + Neon · Zod 4 · React Hook Form · shadcn (Base UI) · Tailwind 4 · Claude API (Anthropic)

## Zanim zaczniesz zadanie

1. Przeczytaj `docs/PROJECT.md`: cel projektu, encje, strony. To jest źródło prawdy o domenie.
   - Wytyczne organizatorów hackathonu (wyzwanie, wymagania, scenariusz demo, kryteria oceny): `docs/CHALLENGE.md` (oryginał: `docs/challenge.pdf`). Decyzje produktowe sprawdzaj z nimi.
2. Encja wzorcowa to `item` (neutralny przykład, nie część domeny). Nową encję buduj, kopiując jej pliki (komenda `/new-feature <encja>`).
3. Czytaj tylko pliki potrzebne do zadania, nie cały projekt.

## Struktura (jeden plik na encję)

- `src/validation/<encja>.ts`: schematy Zod, typy (`z.infer`), stałe enumów i etykiety PL
- `src/actions/<encja>.ts`: server actions (`"use server"`), tylko mutacje, zwracają `ActionResult`
- `src/queries/<encja>.ts`: odczyty z DB (zwykłe funkcje, BEZ `"use server"`), zaczynają się od `await connection()`
- `src/components/<encja>/`: `<encja>-form.tsx` (Dialog + RHF), `<encja>-table.tsx`, `<encja>-row-actions.tsx`
- `src/app/<encja>/page.tsx`: strona (Server Component)
- `src/components/shadcn/`: komponenty UI (nie edytuj bez potrzeby; dodawaj przez `npx shadcn add`)
- `src/components/`: komponenty wspólne (`site-header`, `page-header`, `form-field`, `confirm-delete-button`, `providers`)
- `src/lib/`: `db.ts` (Prisma), `env.ts` (zmienne środowiskowe), `site.ts` (nazwa, nawigacja), `action-result.ts`, `search-agent.ts` (agent AI), `utils.ts`

## Konwencje

- **Konfiguracja aplikacji** (nazwa, opis, linki w nawigacji): tylko `src/lib/site.ts`. Nowa strona = nowy wpis w `site.nav`.
- **Zmienne środowiskowe**: czytaj przez `env` z `@/lib/env`, nie przez `process.env`. Nowa zmienna = dopisz ją do schematu w `env.ts` i do `.env.example`.
- **Server actions** zawsze zwracają `ActionResult` z `@/lib/action-result`:
  - walidacja: `schema.safeParse(input)` → przy błędzie `return validationError(parsed.error)`
  - błąd DB: `try/catch` → `console.error(error)` + `return fail("komunikat PL")`
  - sukces: `revalidatePath(...)` → `return ok()` lub `return ok(data)`
- **Formularze**: RHF + `zodResolver(TEN_SAM_SCHEMAT)`, pola w `<FormField>`, po wyniku akcji `toast.success` / `toast.error` z `sonner`.
- **Enumy**: Prisma `enum` w schemacie + ta sama lista jako `const` w `src/validation/<encja>.ts` (nie importuj `@/generated/prisma` w komponentach klienckich).
- **Teksty w UI**: po polsku. Kod, nazwy plików i zmiennych: po angielsku.
- **Styl kodu**: Prettier (`npm run format`): 2 spacje, podwójne cudzysłowy, średniki.
- DB: `import { db } from "@/lib/db"`; typy modeli: `@/generated/prisma/client` (tylko na serwerze).
- Klasy: `cn` z `@/lib/utils`.

## Zasady

- shadcn = Base UI, NIE Radix: zamiast `asChild` używaj propa `render`.
- Server Components domyślnie, `"use client"` tylko dla interakcji.
- Zmiana DB: edytuj `prisma/schema.prisma` → `npm run db:push`. Dane testowe: `prisma/seed.ts` → `npm run db:seed`.
  - Po `db:push` zrestartuj `npm run dev`: działający serwer trzyma stary klient Prismy (błąd `Cannot read properties of undefined (reading 'findMany')`).
- Nie instaluj nowych paczek bez pytania.
- Next 16 ma breaking changes (patrz AGENTS.md). Przy niepewności czytaj TYLKO konkretny plik z `node_modules/next/dist/docs/`, nie całość.
  - `error.tsx` dostaje `retry` (nie `reset`).

## Koniec zadania

`npm run typecheck` musi przejść (hook uruchamia go automatycznie). Odpowiedź: krótka lista zmienionych plików, bez opisywania kodu.

@AGENTS.md
