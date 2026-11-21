import { connection } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

// Organizację widzi i zmienia tylko jej właściciel. Reguła w jednym miejscu (używają jej też akcje).
export function ownedBusinessWhere(userId: string) {
  return { ownerId: userId };
}

export async function getMyBusinesses() {
  await connection();
  const session = await requireSession();
  return db.business.findMany({
    where: ownedBusinessWhere(session.user.id),
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
}

export async function getMyBusiness(id: string) {
  await connection();
  const session = await requireSession();
  return db.business.findFirst({ where: { id, ...ownedBusinessWhere(session.user.id) } });
}

export type BusinessRow = Awaited<ReturnType<typeof getMyBusinesses>>[number];
