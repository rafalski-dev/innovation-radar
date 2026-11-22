import { connection } from "next/server";
import { db } from "@/lib/db";
import { phrasesSchema } from "@/validation/search";

export type InspirationAspect = { id: string; title: string; phrases: string[] };

// Losowe aspekty na stronę główną „dla inspiracji”. Celowo tylko tytuł i frazy: bez projektu,
// organizacji, autora, opisu i wyników.
export async function getInspirationAspects(count = 6): Promise<InspirationAspect[]> {
  await connection();
  const pool = await db.search.findMany({
    where: { status: "DONE", title: { not: null }, projectId: { not: null } },
    select: { id: true, title: true, phrases: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  // tasowanie Fisher–Yates, żeby każde odświeżenie dawało inny zestaw
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).map((s) => {
    const phrases = phrasesSchema.safeParse(s.phrases);
    return {
      id: s.id,
      title: s.title as string,
      phrases: phrases.success ? phrases.data.slice(0, 3) : [],
    };
  });
}
