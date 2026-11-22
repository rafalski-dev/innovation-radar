import { connection } from "next/server";
import { db } from "@/lib/db";

// Aktywne źródła do wyboru w formularzu aspektu (kolejność: najstarsze pierwsze).
export async function getActiveSources() {
  await connection();
  return db.source.findMany({
    where: { active: true },
    select: { slug: true, name: true, description: true, domain: true },
    orderBy: [{ createdAt: "asc" }, { slug: "asc" }],
  });
}
