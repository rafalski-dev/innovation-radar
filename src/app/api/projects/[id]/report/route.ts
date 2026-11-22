import { renderToBuffer } from "@react-pdf/renderer";
import { reportFileName } from "@/lib/report-file-name";
import { ReportPdf } from "@/lib/report-pdf";
import { getProjectReport } from "@/queries/project";

export const runtime = "nodejs";

// Pobieranie raportu zbiorczego projektu jako pliku PDF (dostęp ma tylko osoba z dostępem do organizacji).
export async function GET(_req: Request, ctx: RouteContext<"/api/projects/[id]/report">) {
  const { id } = await ctx.params;
  const project = await getProjectReport(id);
  if (!project) return new Response("Nie znaleziono projektu", { status: 404 });

  try {
    const buffer = await renderToBuffer(ReportPdf({ project }));
    const name = encodeURIComponent(`${reportFileName(project.title, new Date())}.pdf`);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${name}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Nie udało się wygenerować raportu", { status: 500 });
  }
}
