import { db } from "@/lib/db";
import { createDownloadUrl, isR2Configured } from "@/lib/r2";
import { getSession } from "@/lib/session";
import { accessibleProjectWhere } from "@/queries/project";

// Pobranie PDF przy potrzebie: tylko dla osób z dostępem do organizacji. Plik leży w prywatnym
// buckecie R2, więc po sprawdzeniu dostępu przekierowujemy na krótko ważny podpisany adres.
export async function GET(_request: Request, ctx: RouteContext<"/api/project-files/[fileId]">) {
  const session = await getSession();
  if (!session) return new Response("Zaloguj się", { status: 401 });
  if (!isR2Configured()) return new Response("Pliki nie są skonfigurowane", { status: 503 });

  const { fileId } = await ctx.params;
  const file = await db.projectFile.findFirst({
    where: { id: fileId, project: accessibleProjectWhere(session.user.id) },
  });
  if (!file) return new Response("Nie znaleziono pliku", { status: 404 });

  const url = await createDownloadUrl(file.key, file.fileName);
  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "private, no-store" },
  });
}
