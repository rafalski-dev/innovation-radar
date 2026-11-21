"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { type ActionResult, fail, ok, validationError } from "@/lib/action-result";
import { getSession } from "@/lib/session";
import {
  type AddMemberInput,
  type TeamInput,
  addMemberSchema,
  teamSchema,
} from "@/validation/team";

const PATH = "/dashboard/teams";

export async function createTeam(input: TeamInput): Promise<ActionResult<string>> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = teamSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const team = await db.team.create({
      data: {
        name: parsed.data.name,
        ownerId: session.user.id,
        members: { create: { userId: session.user.id } },
      },
    });
    revalidatePath(PATH);
    return ok(team.id);
  } catch (error) {
    console.error(error);
    return fail("Nie udało się utworzyć zespołu");
  }
}

// Wspólna kontrola: tylko właściciel zarządza zespołem.
async function ownedTeam(teamId: string) {
  const session = await getSession();
  if (!session) return null;
  return db.team.findFirst({ where: { id: teamId, ownerId: session.user.id } });
}

export async function addTeamMember(teamId: string, input: AddMemberInput): Promise<ActionResult> {
  const parsed = addMemberSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    if (!(await ownedTeam(teamId))) return fail("Tylko właściciel zarządza zespołem");
    const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user) return fail("Nie ma użytkownika z takim adresem e-mail");
    const existing = await db.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: user.id } },
    });
    if (existing) return fail("Ta osoba jest już w zespole");

    await db.teamMember.create({ data: { teamId, userId: user.id } });
    revalidatePath(`${PATH}/${teamId}`);
    return ok();
  } catch (error) {
    console.error(error);
    return fail("Nie udało się dodać członka");
  }
}

export async function removeTeamMember(teamId: string, userId: string): Promise<ActionResult> {
  try {
    const team = await ownedTeam(teamId);
    if (!team) return fail("Tylko właściciel zarządza zespołem");
    if (team.ownerId === userId) return fail("Właściciela nie można usunąć z zespołu");

    await db.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });
    revalidatePath(`${PATH}/${teamId}`);
    return ok();
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć członka");
  }
}

export async function deleteTeam(teamId: string): Promise<ActionResult> {
  try {
    if (!(await ownedTeam(teamId))) return fail("Tylko właściciel może usunąć zespół");
    await db.team.delete({ where: { id: teamId } });
    revalidatePath(PATH);
    return ok();
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć zespołu");
  }
}
