import { connection } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { accessibleSearchWhere } from "@/queries/search";

// Materiały = wszystkie zapisane wyniki agenta (po zatwierdzeniu aspektu) z dostępnych aspektów,
// razem z kontekstem AI: opis, uzasadnienie dopasowania, frazy i źródło.
export async function getMyMaterials() {
  await connection();
  const session = await requireSession();
  return db.searchResult.findMany({
    where: { search: accessibleSearchWhere(session.user.id) },
    include: {
      search: {
        select: {
          id: true,
          title: true,
          number: true,
          phrases: true,
          createdAt: true,
          user: { select: { email: true } },
          project: { select: { id: true, title: true, createdAt: true } },
        },
      },
    },
    orderBy: [{ search: { createdAt: "desc" } }, { position: "asc" }],
  });
}

export async function countMyMaterials(userId: string) {
  return db.searchResult.count({ where: { search: accessibleSearchWhere(userId) } });
}
