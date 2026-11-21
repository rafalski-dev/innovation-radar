import { connection } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

// Administrator organizacji = jej właściciel: tylko on edytuje dane, usuwa organizację
// i zarządza osobami. Reguła w jednym miejscu (używają jej też akcje).
export function ownedBusinessWhere(userId: string) {
  return { ownerId: userId };
}

// Dostęp do organizacji (podgląd, potrzeby): administrator albo przypisana osoba.
export function accessibleBusinessWhere(userId: string) {
  return { OR: [{ ownerId: userId }, { members: { some: { userId } } }] };
}

export async function getMyBusinesses() {
  await connection();
  const session = await requireSession();
  return db.business.findMany({
    where: accessibleBusinessWhere(session.user.id),
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
}

// Organizacje użytkownika z potrzebami i osobami (widok wyboru na stronie „Moje organizacje”).
export async function getMyBusinessesWithNeeds() {
  await connection();
  const session = await requireSession();
  const businesses = await db.business.findMany({
    where: accessibleBusinessWhere(session.user.id),
    include: {
      needs: {
        include: {
          files: {
            select: { id: true, fileName: true, size: true },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      },
      owner: { select: { id: true, name: true, email: true } },
      members: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
  return businesses.map((b) => ({ ...b, isAdmin: b.ownerId === session.user.id }));
}

// Do edycji danych organizacji: tylko administrator.
export async function getMyBusiness(id: string) {
  await connection();
  const session = await requireSession();
  return db.business.findFirst({ where: { id, ...ownedBusinessWhere(session.user.id) } });
}

// Do dodawania potrzeb: administrator albo przypisana osoba.
export async function getAccessibleBusiness(id: string) {
  await connection();
  const session = await requireSession();
  return db.business.findFirst({ where: { id, ...accessibleBusinessWhere(session.user.id) } });
}

export type BusinessWithNeeds = Awaited<ReturnType<typeof getMyBusinessesWithNeeds>>[number];
export type BusinessRow = Awaited<ReturnType<typeof getMyBusinesses>>[number];
