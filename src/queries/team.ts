import { connection } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

export async function getMyTeams() {
  await connection();
  const session = await requireSession();
  return db.team.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: { _count: { select: { members: true, innovations: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTeam(id: string) {
  await connection();
  const session = await requireSession();
  const team = await db.team.findFirst({
    where: { id, members: { some: { userId: session.user.id } } },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      innovations: { orderBy: { number: "desc" } },
    },
  });
  return team && { ...team, isOwner: team.ownerId === session.user.id };
}

export type TeamDetail = NonNullable<Awaited<ReturnType<typeof getTeam>>>;
