import { connection } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { accessibleBusinessWhere } from "@/queries/business";

// Potrzebę widzi i zmienia administrator organizacji oraz osoby do niej przypisane.
// Reguła w jednym miejscu (używają jej też akcje).
export function accessibleNeedWhere(userId: string) {
  return { business: accessibleBusinessWhere(userId) };
}

export async function getNeedsForBusiness(businessId: string) {
  await connection();
  const session = await requireSession();
  return db.need.findMany({
    where: { businessId, ...accessibleNeedWhere(session.user.id) },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function getMyNeed(id: string, businessId: string) {
  await connection();
  const session = await requireSession();
  return db.need.findFirst({ where: { id, businessId, ...accessibleNeedWhere(session.user.id) } });
}

export type NeedRow = Awaited<ReturnType<typeof getNeedsForBusiness>>[number];
