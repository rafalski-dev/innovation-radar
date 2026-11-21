import { connection } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

// Widoczność ticketów w JEDNYM miejscu: własne + tickety zespołów, w których jest użytkownik.
// Zmiana reguły (np. urzędnik widzi wszystko) = zmiana tej funkcji.
// Używają jej też akcje (edycja i usuwanie), więc kto widzi, ten może edytować.
export function visibleInnovationWhere(userId: string) {
  return {
    OR: [{ authorId: userId }, { team: { members: { some: { userId } } } }],
  };
}

export async function getInnovations() {
  await connection();
  const session = await requireSession();
  return db.innovation.findMany({
    where: visibleInnovationWhere(session.user.id),
    include: { team: { select: { name: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function getInnovationByNumber(number: number) {
  await connection();
  const session = await requireSession();
  return db.innovation.findFirst({
    where: { number, ...visibleInnovationWhere(session.user.id) },
    include: { team: { select: { name: true } } },
  });
}

export type InnovationRow = Awaited<ReturnType<typeof getInnovations>>[number];
