import { connection } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

// Widoczność ticketów w JEDNYM miejscu. Tymczasowo: tylko własne tickety zalogowanego użytkownika.
// Zmiana reguły (np. urzędnik widzi wszystko) = zmiana tej funkcji.
async function visibleWhere() {
  const session = await requireSession();
  return { authorId: session.user.id };
}

export async function getInnovations() {
  await connection();
  const where = await visibleWhere();
  return db.innovation.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
}

export async function getInnovationByNumber(number: number) {
  await connection();
  const where = await visibleWhere();
  return db.innovation.findFirst({ where: { ...where, number } });
}

export type InnovationRow = Awaited<ReturnType<typeof getInnovations>>[number];
