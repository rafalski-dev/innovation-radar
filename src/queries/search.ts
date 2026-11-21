import { connection } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

// Historia wyszukiwań zalogowanego użytkownika (najnowsze pierwsze).
export async function getMySearches() {
  await connection();
  const session = await requireSession();
  return db.search.findMany({
    where: { userId: session.user.id },
    include: { need: { select: { id: true, title: true, business: { select: { name: true } } } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}
