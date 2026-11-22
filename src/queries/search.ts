import { connection } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { accessibleProjectWhere } from "@/queries/project";

// Aspekt widzi jego autor oraz osoby z dostępem do organizacji projektu (do podglądu).
// Edytować, kopiować i usuwać może tylko autor (sprawdzają to akcje).
export function accessibleSearchWhere(userId: string) {
  return { OR: [{ userId }, { project: accessibleProjectWhere(userId) }] };
}

const projectSelect = {
  id: true,
  title: true,
  createdAt: true,
  sentAt: true,
  business: { select: { name: true } },
} as const;

// Aspekty dostępne dla zalogowanego użytkownika (najnowsze pierwsze), z autorem, frazami i wynikami do podsumowania.
export async function getMySearches() {
  await connection();
  const session = await requireSession();
  const searches = await db.search.findMany({
    where: accessibleSearchWhere(session.user.id),
    include: {
      project: { select: projectSelect },
      user: { select: { email: true } },
      results: { select: { trl: true, sourceName: true } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  return searches.map((s) => ({ ...s, isMine: s.userId === session.user.id }));
}

// Jeden aspekt (podgląd dla autora i osób z dostępem do organizacji) razem z wynikami agenta.
export async function getSearch(id: string) {
  await connection();
  const session = await requireSession();
  const search = await db.search.findFirst({
    where: { id, ...accessibleSearchWhere(session.user.id) },
    include: {
      project: { select: projectSelect },
      user: { select: { email: true } },
      results: { orderBy: { position: "asc" } },
    },
  });
  return search && { ...search, isMine: search.userId === session.user.id };
}
