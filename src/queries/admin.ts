import { connection } from "next/server";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

// Dane panelu administratora (dostęp sprawdza strona przez requireAdmin).
export async function getAdminData() {
  await connection();
  const [sources, emails, topics, settings] = await Promise.all([
    db.source.findMany({ orderBy: [{ createdAt: "asc" }, { slug: "asc" }] }),
    db.blockedEmail.findMany({ orderBy: { createdAt: "desc" } }),
    db.blockedTopic.findMany({ orderBy: { createdAt: "desc" } }),
    getSettings(),
  ]);
  return { sources, emails, topics, settings };
}
