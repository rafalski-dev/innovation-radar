"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { type ActionResult, fail, ok, validationError } from "@/lib/action-result";
import { createUploadUrl, deleteObjects, inspectPdf, isR2Configured } from "@/lib/r2";
import { getSession } from "@/lib/session";
import { accessibleBusinessWhere } from "@/queries/business";
import { accessibleNeedWhere } from "@/queries/need";
import {
  NEED_FILE_MAX_BYTES,
  NEED_FILE_MAX_MB,
  NEED_FILES_MAX,
  type NeedAttachmentInput,
  type NeedInput,
  needSchema,
} from "@/validation/need";

// Krok 1 wysyłki PDF: podpisany adres, pod który przeglądarka wysyła plik prosto do R2.
// Klucz zawiera id użytkownika, więc przy zapisie potrzeby wiemy, że to jego plik.
export async function createNeedFileUpload(input: {
  fileName: string;
  size: number;
  type: string;
}): Promise<ActionResult<{ uploadUrl: string; key: string }>> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");
  if (!isR2Configured()) return fail("Dodawanie plików nie jest jeszcze skonfigurowane");
  if (input.type !== "application/pdf") return fail("Dozwolone są tylko pliki PDF");
  if (input.size <= 0 || input.size > NEED_FILE_MAX_BYTES) {
    return fail(`Plik jest za duży (maksymalnie ${NEED_FILE_MAX_MB} MB)`);
  }

  try {
    const key = `needs/${session.user.id}/${crypto.randomUUID()}.pdf`;
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
  attachment: NeedAttachmentInput,
): Promise<VerifiedFile | { error: string }> {
  if (!isR2Configured()) return { error: "Dodawanie plików nie jest jeszcze skonfigurowane" };
  if (!attachment.key.startsWith(`needs/${userId}/`) || attachment.key.includes("..")) {
    return { error: "Niepoprawny plik" };
  }
  const info = await inspectPdf(attachment.key);
  if (!info) return { error: "Nie znaleziono wysłanego pliku, spróbuj ponownie" };
  if (!info.isPdf || info.size > NEED_FILE_MAX_BYTES) {
    await deleteObjects([attachment.key]);
    return {
      error: info.isPdf
        ? `Plik jest za duży (maksymalnie ${NEED_FILE_MAX_MB} MB)`
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
  attachments: NeedAttachmentInput[],
): Promise<VerifiedFile[] | { error: string }> {
  const verified: VerifiedFile[] = [];
  for (const attachment of attachments) {
    const result = await verifyAttachment(userId, attachment);
    if ("error" in result) {
      await deleteObjects(
        attachments.filter((a) => a.key.startsWith(`needs/${userId}/`)).map((a) => a.key),
      );
      return result;
    }
    verified.push(result);
  }
  return verified;
}

export async function createNeed(
  businessId: string,
  input: NeedInput,
  attachments: NeedAttachmentInput[] = [],
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = needSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  if (attachments.length > NEED_FILES_MAX) {
    return fail(`Maksymalnie ${NEED_FILES_MAX} pliki PDF`);
  }

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

    await db.need.create({
      data: {
        ...parsed.data,
        linkUrl: parsed.data.linkUrl || null,
        businessId,
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
  return ok();
}

// attachments = nowe PDF-y (dopisywane), removeFileIds = pliki do usunięcia
export async function updateNeed(
  id: string,
  input: NeedInput,
  options: { attachments?: NeedAttachmentInput[]; removeFileIds?: string[] } = {},
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  const parsed = needSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const attachments = options.attachments ?? [];
  let files: VerifiedFile[] = [];
  try {
    const existing = await db.need.findFirst({
      where: { id, ...accessibleNeedWhere(session.user.id) },
      include: { files: { select: { id: true, key: true } } },
    });
    if (!existing) return fail("Nie znaleziono projektu");

    const removed = existing.files.filter((f) => options.removeFileIds?.includes(f.id));
    if (existing.files.length - removed.length + attachments.length > NEED_FILES_MAX) {
      return fail(`Maksymalnie ${NEED_FILES_MAX} pliki PDF`);
    }

    const verified = await verifyAttachments(session.user.id, attachments);
    if ("error" in verified) return fail(verified.error);
    files = verified;

    await db.$transaction([
      db.need.update({
        where: { id },
        data: { ...parsed.data, linkUrl: parsed.data.linkUrl || null },
      }),
      db.needFile.deleteMany({ where: { needId: id, id: { in: removed.map((f) => f.id) } } }),
      db.needFile.createMany({ data: files.map((f) => ({ ...f, needId: id })) }),
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

export async function deleteNeed(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Zaloguj się");

  try {
    const files = await db.needFile.findMany({
      where: { needId: id, need: accessibleNeedWhere(session.user.id) },
      select: { key: true },
    });
    const result = await db.need.deleteMany({
      where: { id, ...accessibleNeedWhere(session.user.id) },
    });
    if (result.count === 0) return fail("Nie znaleziono projektu");
    await deleteObjects(files.map((f) => f.key));
  } catch (error) {
    console.error(error);
    return fail("Nie udało się usunąć projekt");
  }

  revalidatePath("/dashboard/businesses", "layout");
  revalidatePath("/dashboard/projects");
  return ok();
}
