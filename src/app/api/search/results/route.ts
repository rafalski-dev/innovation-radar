import { fail, ok, type ActionResult } from "@/lib/action-result";
import { db } from "@/lib/db";
import { phrasesKeyFor, runSearchAgent } from "@/lib/search-agent";
import { getSession } from "@/lib/session";
import { accessibleNeedWhere } from "@/queries/need";
import { generateResultsSchema, type AgentStats, type Candidate } from "@/validation/search";

// Agent szuka kilkadziesiąt sekund.
export const maxDuration = 60;

// Limit uruchomień agenta na użytkownika (koszt API) i czas ważności cache.
const RUN_LIMIT = 5;
const RUN_WINDOW_MS = 30 * 60 * 1000;
const CACHE_MS = 7 * 24 * 60 * 60 * 1000;

type ResultsData = { candidates: Candidate[]; cached: boolean; stats: AgentStats };
const respond = (result: ActionResult<ResultsData>, status = 200) =>
  Response.json(result, { status });

// POST /api/search/results  { needId, phrases }  →  { success, data: { candidates, cached, stats } }
// Uruchamia agenta dla podanych fraz. Niczego nie zapisuje (poza licznikiem limitu):
// użytkownik ocenia listę i zatwierdza ją razem z frazami przy zapisie wyszukiwania.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return respond(fail("Zaloguj się"), 401);

  const body = generateResultsSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return respond(fail(body.error.issues[0]?.message ?? "Niepoprawne dane"), 400);

  try {
    const need = await db.need.findFirst({
      where: { id: body.data.needId, ...accessibleNeedWhere(session.user.id) },
      select: { title: true, description: true },
    });
    if (!need) return respond(fail("Nie znaleziono projektu"), 404);

    // cache: te same frazy dla tego samego projektu w ciągu 7 dni = zapisany wynik, bez kosztu
    const phrasesKey = phrasesKeyFor(body.data.needId, body.data.phrases);
    const cached = await db.search.findFirst({
      where: {
        userId: session.user.id,
        phrasesKey,
        status: "DONE",
        startedAt: { gte: new Date(Date.now() - CACHE_MS) },
      },
      orderBy: { startedAt: "desc" },
      include: { results: { orderBy: { position: "asc" } } },
    });
    if (cached) {
      return respond(
        ok({
          cached: true,
          stats: {
            webSearches: cached.webSearches ?? 0,
            inputTokens: cached.inputTokens ?? 0,
            outputTokens: cached.outputTokens ?? 0,
          },
          candidates: cached.results.map((r) => ({
            title: r.title,
            summary: r.summary,
            organization: r.organization ?? "",
            sourceName: r.sourceName,
            sourceUrl: r.sourceUrl,
            why: r.why,
          })),
        }),
      );
    }

    const recentRuns = await db.agentRun.count({
      where: { userId: session.user.id, createdAt: { gte: new Date(Date.now() - RUN_WINDOW_MS) } },
    });
    if (recentRuns >= RUN_LIMIT) {
      return respond(
        fail(
          `Limit uruchomień agenta: ${RUN_LIMIT} na ${RUN_WINDOW_MS / 60000} minut. Spróbuj za chwilę`,
        ),
        429,
      );
    }
    // liczymy próbę przed wywołaniem, żeby szybkie powtórne kliknięcia też się wliczały
    await db.agentRun.create({ data: { userId: session.user.id } });

    try {
      const output = await runSearchAgent({
        title: need.title,
        description: need.description,
        phrases: body.data.phrases,
      });
      return respond(
        ok({
          cached: false,
          candidates: output.candidates,
          stats: {
            webSearches: output.webSearches,
            inputTokens: output.inputTokens,
            outputTokens: output.outputTokens,
          },
        }),
      );
    } catch (error) {
      console.error(error);
      // w trybie deweloperskim pokazujemy przyczynę w komunikacie (łatwiejsze debugowanie)
      const detail =
        process.env.NODE_ENV !== "production" && error instanceof Error
          ? ` (${error.message.slice(0, 300)})`
          : "";
      return respond(fail(`Agent nie zakończył wyszukiwania. Spróbuj ponownie${detail}`), 502);
    }
  } catch (error) {
    console.error(error);
    return respond(fail("Nie udało się uruchomić wyszukiwania"), 500);
  }
}
