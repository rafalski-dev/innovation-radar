import { connection } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { accessibleBusinessWhere } from "@/queries/business";

// Potrzebę widzi i zmienia administrator organizacji oraz osoby do niej przypisane.
// Reguła w jednym miejscu (używają jej też akcje).
export function accessibleProjectWhere(userId: string) {
  return { business: accessibleBusinessWhere(userId) };
}

export async function getProjectsForBusiness(businessId: string) {
  await connection();
  const session = await requireSession();
  return db.project.findMany({
    where: { businessId, ...accessibleProjectWhere(session.user.id) },
    include: {
      files: {
        select: { id: true, fileName: true, size: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

// Wszystkie potrzeby ze wszystkich dostępnych organizacji (strona /dashboard/projects).
export async function getMyProjects() {
  await connection();
  const session = await requireSession();
  return db.project.findMany({
    where: accessibleProjectWhere(session.user.id),
    include: {
      business: { select: { id: true, name: true, owner: { select: { email: true } } } },
      author: { select: { email: true } },
      searches: {
        select: {
          _count: { select: { results: true } },
          user: { select: { email: true } },
          results: { select: { trl: true, sourceName: true } },
        },
      },
      files: {
        select: { id: true, fileName: true, size: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function getMyProject(id: string, businessId: string) {
  await connection();
  const session = await requireSession();
  return db.project.findFirst({
    where: { id, businessId, ...accessibleProjectWhere(session.user.id) },
    include: {
      files: {
        select: { id: true, fileName: true, size: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

// Dane raportu zbiorczego projektu: projekt, organizacja, pliki oraz aspekty z wynikami.
export async function getProjectReport(id: string) {
  await connection();
  const session = await requireSession();
  return db.project.findFirst({
    where: { id, ...accessibleProjectWhere(session.user.id) },
    include: {
      business: { select: { id: true, name: true, nip: true, city: true } },
      files: {
        select: { id: true, fileName: true, size: true },
        orderBy: { createdAt: "asc" },
      },
      searches: {
        orderBy: [{ number: "asc" }, { createdAt: "asc" }],
        include: { results: { orderBy: { position: "asc" } } },
      },
    },
  });
}

export type ProjectRow = Awaited<ReturnType<typeof getProjectsForBusiness>>[number];
