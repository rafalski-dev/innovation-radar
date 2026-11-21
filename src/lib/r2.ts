import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

// Cloudflare R2 (API zgodne z S3). Tylko na serwerze; bucket jest prywatny, a klient dostaje
// krótko ważne podpisane adresy.
export function isR2Configured() {
  return Boolean(
    env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET,
  );
}

let client: S3Client | undefined;
function getClient() {
  if (!isR2Configured()) throw new Error("Cloudflare R2 nie jest skonfigurowany (zmienne R2_*)");
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env.R2_ACCESS_KEY_ID!, secretAccessKey: env.R2_SECRET_ACCESS_KEY! },
    // R2 nie obsługuje dodatkowych sum kontrolnych, które nowe SDK dokłada domyślnie
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

const UPLOAD_URL_TTL_SECONDS = 300;
const DOWNLOAD_URL_TTL_SECONDS = 60;

export function createUploadUrl(key: string, contentType: string) {
  return getSignedUrl(
    getClient(),
    new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: UPLOAD_URL_TTL_SECONDS },
  );
}

export function createDownloadUrl(key: string, fileName: string) {
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      ResponseContentType: "application/pdf",
      ResponseContentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    }),
    { expiresIn: DOWNLOAD_URL_TTL_SECONDS },
  );
}

// Sprawdza obiekt po wysyłce: rozmiar z R2 (nie od klienta) i sygnaturę PDF. null = brak obiektu.
export async function inspectPdf(key: string): Promise<{ size: number; isPdf: boolean } | null> {
  const c = getClient();
  try {
    const head = await c.send(new HeadObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
    const head5 = await c.send(
      new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: key, Range: "bytes=0-4" }),
    );
    const bytes = (await head5.Body?.transformToByteArray()) ?? new Uint8Array();
    return {
      size: head.ContentLength ?? 0,
      isPdf: new TextDecoder().decode(bytes) === "%PDF-",
    };
  } catch (error) {
    if ((error as { name?: string }).name === "NotFound") return null;
    throw error;
  }
}

// Usuwanie jest „best effort”: błąd R2 nie powinien blokować operacji w bazie, najwyżej zostaje sierota.
export async function deleteObjects(keys: string[]) {
  if (keys.length === 0 || !isR2Configured()) return;
  try {
    await getClient().send(
      new DeleteObjectsCommand({
        Bucket: env.R2_BUCKET,
        Delete: { Objects: keys.map((Key) => ({ Key })) },
      }),
    );
  } catch (error) {
    console.error("Nie udało się usunąć plików z R2", error);
  }
}
