import { connection } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

// Potrzebę widzi i zmienia tylko właściciel jej organizacji. Reguła w jednym miejscu
// (używają jej też akcje).
export function ownedNeedWhere(userId: string) {
  return { business: { ownerId: userId } };
}

export async function getNeedsForBusiness(businessId: string) {
  await connection();
  const session = await requireSession();
  return db.need.findMany({
    where: { businessId, ...ownedNeedWhere(session.user.id) },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function getMyNeed(id: string, businessId: string) {
  await connection();
  const session = await requireSession();
  return db.need.findFirst({ where: { id, businessId, ...ownedNeedWhere(session.user.id) } });
}

export type NeedRow = Awaited<ReturnType<typeof getNeedsForBusiness>>[number];
