import { connection } from "next/server";
import { db } from "@/lib/db";

// connection(): dane zawsze świeże z bazy (strona nie jest prerenderowana przy buildzie).
export async function getItems() {
  await connection();
  // id jako drugi klucz: stała kolejność, gdy createdAt jest taki sam (np. po seedzie)
  return db.item.findMany({ orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
}

export async function getItem(id: string) {
  await connection();
  return db.item.findUnique({ where: { id } });
}

export type ItemRow = Awaited<ReturnType<typeof getItems>>[number];
