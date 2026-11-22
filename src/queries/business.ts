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
export async function getMyBusinessesWithProjects() {
  await connection();
  const session = await requireSession();
  const businesses = await db.business.findMany({
    where: accessibleBusinessWhere(session.user.id),
    include: {
      projects: {
        include: {
          files: {
            select: { id: true, fileName: true, size: true },
            orderBy: { createdAt: "asc" },
          },
          searches: { select: { userId: true } },
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
  return businesses.map((b) => {
    // aktywność osób w organizacji: projekty (autor; stare wpisy bez autora liczymy administratorowi) i aspekty
    const people = [b.owner, ...b.members.map((m) => m.user)];
    const activity = people.map((u) => ({
      userId: u.id,
      name: u.name,
      email: u.email,
      isOwner: u.id === b.ownerId,
      projects: b.projects.filter((p) => (p.authorId ?? b.ownerId) === u.id).length,
      aspects: b.projects.reduce(
        (sum, p) => sum + p.searches.filter((s) => s.userId === u.id).length,
        0,
      ),
    }));
    return { ...b, isAdmin: b.ownerId === session.user.id, activity };
  });
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

export type BusinessWithProjects = Awaited<ReturnType<typeof getMyBusinessesWithProjects>>[number];
export type BusinessRow = Awaited<ReturnType<typeof getMyBusinesses>>[number];
