import { connection } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

// Historia wyszukiwań zalogowanego użytkownika (najnowsze pierwsze).
export async function getMySearches() {
  await connection();
  const session = await requireSession();
  return db.search.findMany({
    where: { userId: session.user.id },
    include: {
      need: {
        select: { id: true, title: true, createdAt: true, business: { select: { name: true } } },
      },
      _count: { select: { results: true } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

// Jedno wyszukiwanie zalogowanego użytkownika razem z wynikami agenta.
export async function getSearch(id: string) {
  await connection();
  const session = await requireSession();
  return db.search.findFirst({
    where: { id, userId: session.user.id },
    include: {
      need: {
        select: {
          id: true,
          title: true,
          createdAt: true,
          sentAt: true,
          business: { select: { name: true } },
        },
      },
      results: { orderBy: { position: "asc" } },
    },
  });
}
