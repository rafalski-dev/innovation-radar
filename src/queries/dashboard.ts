import { connection } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { accessibleBusinessWhere } from "@/queries/business";
import { accessibleNeedWhere } from "@/queries/need";

// Dane strony głównej panelu: liczniki oraz ostatnie projekty i aspekty zalogowanego użytkownika.
export async function getDashboardOverview() {
  await connection();
  const session = await requireSession();
  const userId = session.user.id;
  const needWhere = accessibleNeedWhere(userId);

  const [businesses, needs, searches, results, avgTrl, recentNeeds, recentSearches] =
    await Promise.all([
      db.business.count({ where: accessibleBusinessWhere(userId) }),
      db.need.count({ where: needWhere }),
      db.search.count({ where: { userId } }),
      db.searchResult.count({ where: { search: { userId } } }),
      db.searchResult.aggregate({ _avg: { trl: true }, where: { search: { userId } } }),
      db.need.findMany({
        where: needWhere,
        take: 4,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          title: true,
          createdAt: true,
          sentAt: true,
          business: { select: { name: true } },
          _count: { select: { searches: true } },
        },
      }),
      db.search.findMany({
        where: { userId },
        take: 4,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          number: true,
          query: true,
          createdAt: true,
          need: { select: { title: true, createdAt: true } },
          _count: { select: { results: true } },
        },
      }),
    ]);

  return {
    businesses,
    needs,
    searches,
    results,
    avgTrl: avgTrl._avg.trl,
    recentNeeds,
    recentSearches,
  };
}
