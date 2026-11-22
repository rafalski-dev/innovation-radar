"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { type ActionResult, fail, ok, validationError } from "@/lib/action-result";
import { blockedTopicMessage, findBlockedTopic } from "@/lib/blocklist";
import { sendReportEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { projectNumber } from "@/lib/numbering";
import { createUploadUrl, deleteObjects, inspectPdf, isR2Configured } from "@/lib/r2";
import { getSession } from "@/lib/session";
import { accessibleBusinessWhere } from "@/queries/business";
import { accessibleProjectWhere } from "@/queries/project";
import {
  cleanLinks,
  PROJECT_FILE_MAX_BYTES,
  PROJECT_FILE_MAX_MB,
  PROJECT_FILES_MAX,
  type ProjectAttachmentInput,
  type ProjectInput,
  projectSchema,
} from "@/validation/project";

const CLOSED_MESSAGE = "Raport projektu został wysłany, projekt jest zamknięty do edycji";

// Krok 1 wysyłki PDF: podpisany adres, pod który przeglądarka wysyła plik prosto do R2.
// Klucz zawiera id użytkownika, więc przy zapisie potrzeby wiemy, że to jego plik.
export async function createProjectFileUpload(input: {
  fileName: string;
  size: number;
  type: string;
}): Promise<ActionResult<{ uploadUrl: string; key: string }>> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");
  if (!isR2Configured()) return fail("Dodawanie plików nie jest jeszcze skonfigurowane");
  if (input.type !== "application/pdf") return fail("Dozwolone są tylko pliki PDF");
  if (input.size <= 0 || input.size > PROJECT_FILE_MAX_BYTES) {
    return fail(`Plik jest za duży (maksymalnie ${PROJECT_FILE_MAX_MB} MB)`);
  }

  try {
    const key = `projects/${session.user.id}/${crypto.randomUUID()}.pdf`;
    return ok({ uploadUrl: await createUploadUrl(key, "application/pdf"), key });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się przygotować wysyłki pliku");
  }
}

type VerifiedFile = { key: string; fileName: string; size: number };

// Krok 2: przed zapisem sprawdzamy, że plik jest w R2, należy do użytkownika i jest PDF-em.
async function verifyAttachment(
  userId: string,
  attachment: ProjectAttachmentInput,
): Promise<VerifiedFile | { error: string }> {
  if (!isR2Configured()) return { error: "Dodawanie plików nie jest jeszcze skonfigurowane" };
  if (!attachment.key.startsWith(`projects/${userId}/`) || attachment.key.includes("..")) {
    return { error: "Niepoprawny plik" };
  }
  const info = await inspectPdf(attachment.key);
  if (!info) return { error: "Nie znaleziono wysłanego pliku, spróbuj ponownie" };
  if (!info.isPdf || info.size > PROJECT_FILE_MAX_BYTES) {
    await deleteObjects([attachment.key]);
    return {
      error: info.isPdf
        ? `Plik jest za duży (maksymalnie ${PROJECT_FILE_MAX_MB} MB)`
        : "Dozwolone są tylko pliki PDF",
    };
  }
  return {
    key: attachment.key,
    fileName: attachment.fileName.slice(0, 200) || "plik.pdf",
    size: info.size,
  };
}

// Weryfikuje wszystkie wysłane pliki; przy błędzie kasuje je z R2 (żeby nie zostawały sieroty).
async function verifyAttachments(
  userId: string,
  attachments: ProjectAttachmentInput[],
): Promise<VerifiedFile[] | { error: string }> {
  const verified: VerifiedFile[] = [];
  for (const attachment of attachments) {
    const result = await verifyAttachment(userId, attachment);
    if ("error" in result) {
      await deleteObjects(
        attachments.filter((a) => a.key.startsWith(`projects/${userId}/`)).map((a) => a.key),
      );
      return result;
    }
    verified.push(result);
  }
  return verified;
}

export async function createProject(
  businessId: string,
  input: ProjectInput,
  attachments: ProjectAttachmentInput[] = [],
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  if (attachments.length > PROJECT_FILES_MAX) {
    return fail(`Maksymalnie ${PROJECT_FILES_MAX} pliki PDF`);
  }
  const blocked = await findBlockedTopic(parsed.data.title, parsed.data.description);
  if (blocked) return fail(blockedTopicMessage(blocked));

  let files: VerifiedFile[] = [];
  try {
    // potrzebę można dodać do organizacji, do której masz dostęp
    const business = await db.business.findFirst({
      where: { id: businessId, ...accessibleBusinessWhere(session.user.id) },
    });
    if (!business) return fail("Nie znaleziono organizacji");

    const verified = await verifyAttachments(session.user.id, attachments);
    if ("error" in verified) return fail(verified.error);
    files = verified;

    await db.project.create({
      data: {
        ...parsed.data,
        linkUrls: cleanLinks(parsed.data.linkUrls),
        businessId,
        authorId: session.user.id,
        files: { create: files },
      },
    });
  } catch (error) {
    console.error(error);
    await deleteObjects(files.map((f) => f.key));
    return fail("Nie udało się zapisać projekt");
  }

  revalidatePath(`/dashboard/businesses/${businessId}`);
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard", "layout"); // liczniki w menu
  return ok();
}

// attachments = nowe PDF-y (dopisywane), removeFileIds = pliki do usunięcia
export async function updateProject(
  id: string,
  input: ProjectInput,
  options: { attachments?: ProjectAttachmentInput[]; removeFileIds?: string[] } = {},
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const blocked = await findBlockedTopic(parsed.data.title, parsed.data.description);
  if (blocked) return fail(blockedTopicMessage(blocked));

  const attachments = options.attachments ?? [];
  let files: VerifiedFile[] = [];
  try {
    const existing = await db.project.findFirst({
      where: { id, ...accessibleProjectWhere(session.user.id) },
      include: { files: { select: { id: true, key: true } } },
    });
    if (!existing) return fail("Nie znaleziono projektu");
    if (existing.sentAt) return fail(CLOSED_MESSAGE);

    const removed = existing.files.filter((f) => options.removeFileIds?.includes(f.id));
    if (existing.files.length - removed.length + attachments.length > PROJECT_FILES_MAX) {
      return fail(`Maksymalnie ${PROJECT_FILES_MAX} pliki PDF`);
    }

    const verified = await verifyAttachments(session.user.id, attachments);
    if ("error" in verified) return fail(verified.error);
    files = verified;

    await db.$transaction([
      db.project.update({
        where: { id },
        data: {
          ...parsed.data,
          linkUrls: cleanLinks(parsed.data.linkUrls),
        },
      }),
      db.projectFile.deleteMany({ where: { projectId: id, id: { in: removed.map((f) => f.id) } } }),
      db.projectFile.createMany({ data: files.map((f) => ({ ...f, projectId: id })) }),
    ]);

    await deleteObjects(removed.map((f) => f.key));
  } catch (error) {
    console.error(error);
    await deleteObjects(files.map((f) => f.key));
    return fail("Nie udało się zapisać zmian");
  }

  revalidatePath("/dashboard/businesses", "layout");
  revalidatePath("/dashboard/projects");
  return ok();
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  try {
    const current = await db.project.findFirst({
      where: { id, ...accessibleProjectWhere(session.user.id) },
      select: { sentAt: true },
    });
    if (current?.sentAt) return fail(CLOSED_MESSAGE);
    const files = await db.projectFile.findMany({
      where: { projectId: id, project: accessibleProjectWhere(session.user.id) },
      select: { key: true },
    });
    const result = await db.project.deleteMany({
      where: { id, ...accessibleProjectWhere(session.user.id) },
    });
    if (result.count === 0) return fail("Nie znaleziono projektu");
    await deleteObjects(files.map((f) => f.key));
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć projekt");
  }

  revalidatePath("/dashboard/businesses", "layout");
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard", "layout"); // liczniki w menu (projekty i aspekty)
  return ok();
}

// Duplikuje projekt (tytuł z dopiskiem „kopia”, opis i linki). Aspekty i pliki PDF nie są kopiowane.
export async function duplicateProject(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  try {
    const source = await db.project.findFirst({
      where: { id, ...accessibleProjectWhere(session.user.id) },
    });
    if (!source) return fail("Nie znaleziono projektu");
    await db.project.create({
      data: {
        businessId: source.businessId,
        authorId: session.user.id,
        title: `${source.title} (kopia)`.slice(0, 150),
        description: source.description,
        linkUrls: source.linkUrls,
      },
    });
  } catch (error) {
    console.error(error);
    return fail("Nie udało się zduplikować projektu");
  }

  revalidatePath("/dashboard/businesses", "layout");
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard", "layout"); // liczniki w menu
  return ok();
}

// Wysyła raport projektu do właściciela i wszystkich członków organizacji i zamyka projekt do edycji.
export async function sendProjectReport(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  try {
    const project = await db.project.findFirst({
      where: { id, ...accessibleProjectWhere(session.user.id) },
      include: {
        business: {
          select: {
            name: true,
            owner: { select: { email: true } },
            members: { select: { user: { select: { email: true } } } },
          },
        },
        searches: { select: { _count: { select: { results: true } } } },
      },
    });
    if (!project) return fail("Nie znaleziono projektu");
    if (project.sentAt) return fail("Raport tego projektu został już wysłany");
    if (project.searches.length === 0) {
      return fail("Dodaj przynajmniej jeden aspekt, zanim wyślesz raport");
    }

    // zamykamy projekt warunkowo, żeby podwójne kliknięcie nie wysłało maili dwa razy
    const closed = await db.project.updateMany({
      where: { id, sentAt: null },
      data: { sentAt: new Date() },
    });
    if (closed.count === 0) return fail("Raport tego projektu został już wysłany");

    const recipients = [
      ...new Set([
        project.business.owner.email,
        ...project.business.members.map((m) => m.user.email),
      ]),
    ];
    const data = {
      projectTitle: project.title,
      projectNumber: projectNumber(project.createdAt),
      businessName: project.business.name,
      senderName: session.user.name,
      aspects: project.searches.length,
      results: project.searches.reduce((sum, s) => sum + s._count.results, 0),
      url: `${env.BETTER_AUTH_URL}/api/projects/${id}/report`,
    };
    const sent = await Promise.allSettled(recipients.map((to) => sendReportEmail(to, data)));
    for (const result of sent) if (result.status === "rejected") console.error(result.reason);
  } catch (error) {
    console.error(error);
    return fail("Nie udało się wysłać raportu");
  }

  revalidatePath("/dashboard/businesses", "layout");
  revalidatePath("/dashboard/projects");
  return ok();
}
