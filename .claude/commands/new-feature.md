---
description: Nowa encja (model + walidacja + akcje + zapytania + komponenty + strona)
argument-hint: <encja>
---

Zbuduj encję "$ARGUMENTS" według CLAUDE.md, kopiując wzorzec encji `item`.
Pola i enumy weź z `docs/PROJECT.md` (sekcja 3). Jeśli encji tam nie ma albo czegoś brakuje, zapytaj, zanim zaczniesz.

Pliki wzorca (czytaj tylko je):

- prisma/schema.prisma (model Item + enumy)
- src/validation/item.ts
- src/queries/item.ts
- src/actions/item.ts
- src/components/item/\*
- src/app/item/page.tsx

Kroki:

1. Model (+ enumy, relacje) w prisma/schema.prisma → `npm run db:push`
2. src/validation/$ARGUMENTS.ts: schemat Zod, typy, stałe enumów + etykiety PL
3. src/queries/$ARGUMENTS.ts: lista i pojedynczy rekord (`await connection()`)
4. src/actions/$ARGUMENTS.ts: create/update/delete, zwracają `ActionResult`, `revalidatePath`
5. src/components/$ARGUMENTS/: formularz w Dialog (RHF + zodResolver + FormField), tabela, akcje wiersza
6. src/app/$ARGUMENTS/page.tsx + wpis w `site.nav` (src/lib/site.ts)
7. Opcjonalnie: przykładowe dane w prisma/seed.ts
8. Zaktualizuj docs/PROJECT.md (encja oznaczona jako gotowa)

Na końcu `npm run typecheck`.
