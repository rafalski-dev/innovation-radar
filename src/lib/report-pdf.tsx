import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { GEIST_REGULAR } from "@/lib/pdf-font";
import { aspectLabel, aspectTitle, projectNumber } from "@/lib/numbering";
import { pickNextStep, summarizeAspect } from "@/lib/report";
import { site } from "@/lib/site";
import { TRL_BANDS, TRL_LABELS, effectiveTrl, formatTrlRange, trlRange } from "@/lib/trl";
import type { getProjectReport } from "@/queries/project";

type Project = NonNullable<Awaited<ReturnType<typeof getProjectReport>>>;

// Jeden plik fontu (bez pogrubienia): ten sam dla wag 400 i 700, żeby react-pdf nie szukał innego.
Font.register({
  family: "Geist",
  fonts: [
    { src: GEIST_REGULAR, fontWeight: 400 },
    { src: GEIST_REGULAR, fontWeight: 700 },
  ],
});
// Bez dzielenia słów, poza bardzo długimi (adresy URL), które inaczej wychodzą poza stronę.
Font.registerHyphenationCallback((word) =>
  word.length > 28 ? (word.match(/.{1,24}/g) ?? [word]) : [word],
);

const dateFormat = new Intl.DateTimeFormat("pl-PL", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Warsaw",
});
const formatAverage = (v: number | null) => (v == null ? "—" : v.toFixed(1).replace(".", ","));
const formatSize = (b: number) =>
  b < 1024 * 1024
    ? `${Math.max(1, Math.round(b / 1024))} KB`
    : `${(b / (1024 * 1024)).toFixed(1)} MB`;

const GRAY = "#6b7280";
const BRAND = "#e8590c";
const s = StyleSheet.create({
  page: { fontFamily: "Geist", fontSize: 10, padding: 40, lineHeight: 1.4, color: "#111827" },
  muted: { color: GRAY },
  small: { fontSize: 8.5 },
  h1: { fontSize: 20, fontWeight: 700, lineHeight: 1.3, marginTop: 2, marginBottom: 8 },
  h2: { fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 6 },
  header: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 10 },
  card: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 6, padding: 10, marginBottom: 8 },
  brandCard: { borderColor: BRAND, backgroundColor: "#fff7ed" },
  row: { flexDirection: "row", gap: 6 },
  statBox: { flex: 1, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 6, padding: 6 },
  statValue: { fontSize: 13, fontWeight: 700 },
  result: { borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 6, marginTop: 6 },
  source: { marginTop: 4, color: BRAND, fontSize: 8.5 },
  mt: { marginTop: 3 },
});

export function ReportPdf({ project }: { project: Project }) {
  const allResults = project.searches.flatMap((x) => x.results);
  const projectRange = trlRange(allResults.map((r) => r.trl));
  const nextStep = pickNextStep(project.searches);
  const stats: [string, string | number][] = [
    ["Aspekty", project.searches.length],
    ["Wyniki", allResults.length],
    ["Rozpiętość TRL", projectRange ? formatTrlRange(projectRange) : "—"],
    ["Linki", project.linkUrls.length],
    ["Pliki PDF", project.files.length],
  ];

  return (
    <Document title={project.title} author={site.name}>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={[s.muted, s.small]}>
            {site.name} · raport z {dateFormat.format(new Date())}
          </Text>
          <Text style={[s.muted, { fontSize: 10 }]}>{projectNumber(project.createdAt)}</Text>
          <Text style={s.h1}>{project.title}</Text>
          <Text style={s.muted}>
            {project.business.name}
            {project.business.city ? ` · ${project.business.city}` : ""}
            {project.business.nip ? ` · NIP ${project.business.nip}` : ""}
          </Text>
          {project.sentAt && (
            <Text style={[s.muted, s.small, s.mt]}>
              Raport wysłany do członków organizacji: {dateFormat.format(project.sentAt)}
            </Text>
          )}
        </View>

        <Text style={s.h2}>Opis projektu</Text>
        <Text>{project.description}</Text>

        <Text style={s.h2}>Podsumowanie</Text>
        <View style={s.row}>
          {stats.map(([label, value]) => (
            <View key={label} style={s.statBox}>
              <Text style={[s.muted, s.small]}>{label}</Text>
              <Text style={s.statValue}>{value}</Text>
            </View>
          ))}
        </View>
        <Text style={[s.muted, s.small, s.mt]}>
          Wynik bez oceny TRL ze źródła liczymy jako TRL 2.
        </Text>

        <View style={[s.card, s.brandCard, { marginTop: 14 }]} wrap={false}>
          <Text style={[s.h2, { marginTop: 0 }]}>Rekomendowany następny krok</Text>
          {nextStep ? (
            <>
              <Text>
                Kontynuuj aspekt „{aspectTitle(nextStep.aspect.title, nextStep.aspect.number)}”
                {aspectLabel(nextStep.aspect.number, project.createdAt)
                  ? ` (${aspectLabel(nextStep.aspect.number, project.createdAt)})`
                  : ""}
                : ma najwyższy poziom TRL w wynikach wyszukiwania (TRL {nextStep.maxTrl}/9:{" "}
                {TRL_LABELS[nextStep.maxTrl]}).
              </Text>
              {nextStep.summary.best && (
                <Text style={[s.muted, s.mt]}>
                  Najbardziej dojrzały wynik: {nextStep.summary.best.title} ·{" "}
                  {nextStep.summary.best.sourceName}
                  {"\n"}
                  {nextStep.summary.best.sourceUrl}
                </Text>
              )}
              {nextStep.onlyAssumed && (
                <Text style={[s.muted, s.small, s.mt]}>
                  Uwaga: żaden wynik tego aspektu nie ma oceny TRL ze źródła (przyjęto TRL 2), więc
                  rekomendacja jest orientacyjna.
                </Text>
              )}
            </>
          ) : (
            <Text style={s.muted}>
              Brak wyników w aspektach, więc nie ma z czego wskazać następnego kroku.
            </Text>
          )}
        </View>

        {(project.linkUrls.length > 0 || project.files.length > 0) && (
          <>
            <Text style={s.h2}>Materiały projektu</Text>
            {project.linkUrls.map((url) => (
              <Text key={url}>{url}</Text>
            ))}
            {project.files.map((f) => (
              <Text key={f.id}>
                {f.fileName} ({formatSize(f.size)})
              </Text>
            ))}
          </>
        )}

        <Text style={s.h2}>Podsumowanie aspektów</Text>
        {project.searches.length === 0 && (
          <Text style={s.muted}>Projekt nie ma jeszcze aspektów.</Text>
        )}
        {project.searches.map((search) => {
          const summary = summarizeAspect(search.results);
          return (
            <View key={search.id} style={s.card} wrap={false}>
              <Text style={{ fontWeight: 700 }}>{aspectTitle(search.title, search.number)}</Text>
              {aspectLabel(search.number, project.createdAt) && (
                <Text style={[s.muted, s.small]}>
                  {aspectLabel(search.number, project.createdAt)}
                </Text>
              )}
              {nextStep?.aspect.id === search.id && (
                <Text style={[s.small, { color: BRAND }]}>Rekomendowany następny krok</Text>
              )}
              {summary.count === 0 ? (
                <Text style={[s.muted, s.mt]}>
                  Brak zapisanych wyników, więc nie ma rozpiętości TRL.
                </Text>
              ) : (
                <>
                  <Text style={s.mt}>
                    Rozpiętość TRL: {formatTrlRange(summary.range)} (średnio{" "}
                    {formatAverage(summary.average)})
                  </Text>
                  <Text style={s.muted}>
                    Wyniki: {summary.count} · źródła: {summary.sources.join(", ")}
                  </Text>
                  <Text style={[s.muted, s.small]}>
                    {TRL_BANDS.map(
                      (b) => `${b.label} (TRL ${b.from}–${b.to}): ${summary.bands[b.key]}`,
                    ).join("  ·  ")}
                  </Text>
                </>
              )}
            </View>
          );
        })}

        <Text style={s.h2} break>
          Aspekty i wyniki
        </Text>
        {project.searches.map((search) => {
          const range = trlRange(search.results.map((r) => r.trl));
          return (
            <View key={search.id} style={{ marginBottom: 14 }}>
              <Text style={{ fontWeight: 700, fontSize: 11 }} minPresenceAhead={60}>
                {aspectTitle(search.title, search.number)}
              </Text>
              <Text style={[s.muted, s.small]}>
                {aspectLabel(search.number, project.createdAt) ?? "Aspekt"} · Wyniki:{" "}
                {search.results.length}
                {range ? ` · ${formatTrlRange(range)}` : ""}
              </Text>
              {search.results.length === 0 && (
                <Text style={[s.muted, s.mt]}>Brak zapisanych wyników.</Text>
              )}
              {search.results.map((r, i) => (
                <View key={r.id} style={s.result} wrap={false}>
                  <Text style={{ fontWeight: 700 }}>
                    {i + 1}. {r.title}{" "}
                    <Text style={[s.muted, s.small]}>
                      (TRL {effectiveTrl(r.trl)}
                      {r.trl == null ? ", wartość domyślna" : ""})
                    </Text>
                  </Text>
                  <Text style={s.mt}>{r.summary}</Text>
                  <Text style={[s.muted, s.mt]}>Dlaczego pasuje: {r.why}</Text>
                  <Text style={s.source}>
                    Źródło: {r.sourceName}
                    {r.organization ? ` · ${r.organization}` : ""} · {r.sourceUrl}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}

        <Text
          style={[s.muted, s.small, { position: "absolute", bottom: 20, right: 40 }]}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
