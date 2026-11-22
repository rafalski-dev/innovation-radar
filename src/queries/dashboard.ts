import { connection } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { DEFAULT_TRL } from "@/lib/trl";
import { accessibleBusinessWhere } from "@/queries/business";
import { accessibleNeedWhere } from "@/queries/need";

// Liczniki przy pozycjach menu: organizacje, projekty (z dostępnych organizacji) i aspekty użytkownika.
// Te same reguły dostępu co listy, na które prowadzą pozycje menu.
export async function getNavCounts() {
  await connection();
  const session = await requireSession();
  const userId = session.user.id;
  const [businesses, needs, searches] = await Promise.all([
    db.business.count({ where: accessibleBusinessWhere(userId) }),
    db.need.count({ where: accessibleNeedWhere(userId) }),
    db.search.count({ where: { userId } }),
  ]);
  return { businesses, needs, searches };
}

// Dane strony głównej panelu: liczniki oraz ostatnie projekty i aspekty zalogowanego użytkownika.
export async function getDashboardOverview() {
  await connection();
  const session = await requireSession();
  const userId = session.user.id;
  const needWhere = accessibleNeedWhere(userId);

  const [businesses, needs, searches, results, trlStats, recentNeeds, recentSearches] =
    await Promise.all([
      db.business.count({ where: accessibleBusinessWhere(userId) }),
      db.need.count({ where: needWhere }),
      db.search.count({ where: { userId } }),
      db.searchResult.count({ where: { search: { userId } } }),
      db.searchResult.aggregate({
        _sum: { trl: true },
        _count: { _all: true, trl: true },
        where: { search: { userId } },
      }),
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
          title: true,
          query: true,
          createdAt: true,
          need: { select: { title: true, createdAt: true } },
          _count: { select: { results: true } },
        },
      }),
    ]);

  // średni TRL wyników: wyniki bez oceny liczą się jako DEFAULT_TRL (jak w raporcie projektu)
  const total = trlStats._count._all;
  const unrated = total - trlStats._count.trl;
  const avgTrl = total > 0 ? ((trlStats._sum.trl ?? 0) + unrated * DEFAULT_TRL) / total : null;

  return {
    businesses,
    needs,
    searches,
    results,
    avgTrl,
    recentNeeds,
    recentSearches,
  };
}
