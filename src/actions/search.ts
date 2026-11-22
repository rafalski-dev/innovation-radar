"use server";

import { revalidatePath } from "next/cache";
import { fail, ok, validationError, type ActionResult } from "@/lib/action-result";
import { db } from "@/lib/db";
import { blockedTopicMessage, findBlockedTopic } from "@/lib/blocklist";
import { phrasesKeyFor } from "@/lib/search-agent";
import { aspectTitle } from "@/lib/numbering";
import { getSession } from "@/lib/session";
import { accessibleProjectWhere } from "@/queries/project";
import { searchSchema, type SearchInput } from "@/validation/search";

const CLOSED_MESSAGE = "Raport projektu został wysłany, projekt jest zamknięty do edycji";

// Odświeża listy i liczniki w menu (layout panelu).
function revalidateAspects() {
  revalidatePath("/dashboard/search");
  revalidatePath("/dashboard", "layout");
}

// Zapisuje wyszukiwanie w historii razem z zatwierdzonymi frazami i (opcjonalnie) listą wyników agenta.
export async function createSearch(input: SearchInput): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = searchSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const blocked = await findBlockedTopic(
    parsed.data.title,
    parsed.data.query,
    ...(parsed.data.phrases ?? []),
  );
  if (blocked) return fail(blockedTopicMessage(blocked));

  try {
    if (parsed.data.projectId) {
      const project = await db.project.findFirst({
        where: { id: parsed.data.projectId, ...accessibleProjectWhere(session.user.id) },
        select: { id: true, sentAt: true },
      });
      if (!project) return fail("Nie znaleziono projektu");
      if (project.sentAt) return fail(CLOSED_MESSAGE);
    }

    const { results, stats, phrases, sources, limit } = parsed.data;
    // numer aspektu: kolejny w projekcie (lub wśród aspektów bez projektu)
    const number = await nextNumber(parsed.data.projectId || null, session.user.id);

    const search = await db.search.create({
      data: {
        title: parsed.data.title,
        query: parsed.data.query,
        projectId: parsed.data.projectId || null,
        phrases,
        number,
        userId: session.user.id,
        ...(results && {
          status: "DONE" as const,
          startedAt: new Date(),
          phrasesKey: phrases?.length
            ? phrasesKeyFor(parsed.data.projectId || parsed.data.query, phrases, sources, limit)
            : null,
          webSearches: stats?.webSearches,
          inputTokens: stats?.inputTokens,
          outputTokens: stats?.outputTokens,
          results: {
            create: results.map((c, position) => ({
              position,
              title: c.title,
              summary: c.summary,
              organization: c.organization || null,
              sourceName: c.sourceName,
              sourceUrl: c.sourceUrl,
              why: c.why,
              trl: c.trl,
            })),
          },
        }),
      },
      select: { id: true },
    });
    revalidateAspects();
    return ok({ id: search.id });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się zapisać aspektu");
  }
}

// Edycja zapisanego aspektu w miejscu: tytuł, frazy i lista wyników (stare wyniki są zastępowane).
// Projektu i numeru aspektu nie zmieniamy.
export async function updateSearch(id: string, input: SearchInput): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = searchSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const blocked = await findBlockedTopic(
    parsed.data.title,
    parsed.data.query,
    ...(parsed.data.phrases ?? []),
  );
  if (blocked) return fail(blockedTopicMessage(blocked));

  try {
    const current = await db.search.findFirst({
      where: { id, userId: session.user.id },
      select: { projectId: true, project: { select: { sentAt: true } } },
    });
    if (!current) return fail("Nie znaleziono aspektu");
    if (current.project?.sentAt) return fail(CLOSED_MESSAGE);

    const { results, stats, phrases, sources, limit } = parsed.data;
    await db.$transaction([
      db.searchResult.deleteMany({ where: { searchId: id } }),
      db.search.update({
        where: { id },
        data: {
          title: parsed.data.title,
          query: parsed.data.query,
          phrases,
          ...(results && {
            status: "DONE" as const,
            phrasesKey: phrases?.length
              ? phrasesKeyFor(current.projectId || parsed.data.query, phrases, sources, limit)
              : null,
            webSearches: stats?.webSearches,
            inputTokens: stats?.inputTokens,
            outputTokens: stats?.outputTokens,
            results: {
              create: results.map((c, position) => ({
                position,
                title: c.title,
                summary: c.summary,
                organization: c.organization || null,
                sourceName: c.sourceName,
                sourceUrl: c.sourceUrl,
                why: c.why,
                trl: c.trl,
              })),
            },
          }),
        },
      }),
    ]);
    revalidateAspects();
    revalidatePath(`/dashboard/search/${id}`);
    return ok();
  } catch (error) {
    console.error(error);
    return fail("Nie udało się zapisać zmian");
  }
}

// Kopiuje zapisany aspekt (tytuł z dopiskiem „kopia”, frazy i wyniki) jako nowy aspekt tego samego projektu.
// Kopię można potem edytować albo usunąć; oryginał zostaje bez zmian.
export async function copySearch(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  try {
    const source = await db.search.findFirst({
      where: { id, userId: session.user.id },
      include: {
        project: { select: { sentAt: true } },
        results: { orderBy: { position: "asc" } },
      },
    });
    if (!source) return fail("Nie znaleziono aspektu");
    if (source.project?.sentAt) return fail(CLOSED_MESSAGE);

    const copy = await db.search.create({
      data: {
        title: `${source.title ?? aspectTitle(null, source.number)} (kopia)`.slice(0, 150),
        query: source.query,
        phrases: source.phrases ?? undefined,
        number: await nextNumber(source.projectId, session.user.id),
        status: source.status,
        startedAt: source.startedAt,
        webSearches: source.webSearches,
        inputTokens: source.inputTokens,
        outputTokens: source.outputTokens,
        userId: session.user.id,
        projectId: source.projectId,
        // bez phrasesKey, żeby kopia nie dublowała wpisu w cache wyszukiwań
        results: {
          create: source.results.map((r) => ({
            position: r.position,
            title: r.title,
            summary: r.summary,
            organization: r.organization,
            sourceName: r.sourceName,
            sourceUrl: r.sourceUrl,
            why: r.why,
            trl: r.trl,
          })),
        },
      },
      select: { id: true },
    });
    revalidateAspects();
    return ok({ id: copy.id });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się skopiować aspektu");
  }
}

// Kolejny numer aspektu w projekcie (lub wśród aspektów użytkownika bez projektu).
async function nextNumber(projectId: string | null, userId: string) {
  const last = await db.search.aggregate({
    _max: { number: true },
    where: projectId ? { projectId } : { userId, projectId: null },
  });
  return (last._max.number ?? 0) + 1;
}

// Usuwa wyszukiwanie użytkownika razem z zapisanymi wynikami (kaskadowo).
export async function deleteSearch(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  try {
    // aspektów projektu z wysłanym raportem nie usuwamy (raport jest zamknięty)
    const current = await db.search.findFirst({
      where: { id, userId: session.user.id },
      select: { project: { select: { sentAt: true } } },
    });
    if (current?.project?.sentAt) return fail(CLOSED_MESSAGE);
    const { count } = await db.search.deleteMany({ where: { id, userId: session.user.id } });
    if (count === 0) return fail("Nie znaleziono aspektu");
    revalidateAspects();
    return ok();
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć aspektu");
  }
}
