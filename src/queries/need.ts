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
    include: {
      files: { select: { id: true, fileName: true, size: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

// Wszystkie potrzeby ze wszystkich dostępnych organizacji (strona /dashboard/projects).
export async function getMyNeeds() {
  await connection();
  const session = await requireSession();
  return db.need.findMany({
    where: accessibleNeedWhere(session.user.id),
    include: {
      business: { select: { id: true, name: true } },
      files: { select: { id: true, fileName: true, size: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function getMyNeed(id: string, businessId: string) {
  await connection();
  const session = await requireSession();
  return db.need.findFirst({
    where: { id, businessId, ...accessibleNeedWhere(session.user.id) },
    include: {
      files: { select: { id: true, fileName: true, size: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

export type NeedRow = Awaited<ReturnType<typeof getNeedsForBusiness>>[number];
