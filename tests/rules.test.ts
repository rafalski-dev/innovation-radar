import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aspectLabel, aspectTitle, projectNumber } from "../src/lib/numbering";
import { pickNextStep, summarizeAspect } from "../src/lib/report";
import { reportFileName } from "../src/lib/report-file-name";
import { DEFAULT_TRL, effectiveTrl, formatTrlRange, trlRange } from "../src/lib/trl";
import { businessSchema, normalizeNip } from "../src/validation/business";
import { cleanLinks, projectSchema } from "../src/validation/project";
import { candidateSchema, searchSchema, webSearchesFor } from "../src/validation/search";

const candidate = {
  title: "Tytuł",
  summary: "Opis",
  organization: "",
  sourceName: "NCBiR",
  sourceUrl: "https://www.gov.pl/web/ncbr",
  why: "Pasuje",
  trl: 6,
};

describe("wynik agenta (candidateSchema)", () => {
  it("przyjmuje adres https", () => {
    assert.equal(candidateSchema.safeParse(candidate).success, true);
  });

  it("odrzuca adresy inne niż http(s)", () => {
    for (const sourceUrl of ["javascript:alert(1)", "data:text/html,x", "ftp://example.com/a"]) {
      assert.equal(
        candidateSchema.safeParse({ ...candidate, sourceUrl }).success,
        false,
        sourceUrl,
      );
    }
  });

  it("TRL musi być liczbą 1-9 albo null", () => {
    assert.equal(candidateSchema.safeParse({ ...candidate, trl: null }).success, true);
    assert.equal(candidateSchema.safeParse({ ...candidate, trl: 0 }).success, false);
    assert.equal(candidateSchema.safeParse({ ...candidate, trl: 10 }).success, false);
  });
});

describe("zapis aspektu (searchSchema)", () => {
  const base = {
    title: "Odzysk metali",
    query: "Recykling baterii litowo-jonowych",
    projectId: "",
  };

  it("przyjmuje poprawne dane", () => {
    assert.equal(searchSchema.safeParse(base).success, true);
  });

  it("wymaga tytułu aspektu (3-150 znaków)", () => {
    assert.equal(searchSchema.safeParse({ ...base, title: "" }).success, false);
    assert.equal(searchSchema.safeParse({ ...base, title: "ab" }).success, false);
    assert.equal(searchSchema.safeParse({ ...base, title: "a".repeat(151) }).success, false);
    assert.equal(searchSchema.safeParse({ ...base, title: undefined }).success, false);
  });

  it("odrzuca zbyt krótkie zapytanie i zbyt wiele wyników", () => {
    assert.equal(searchSchema.safeParse({ ...base, query: "krótko" }).success, false);
    const results = Array.from({ length: 10 }, () => candidate);
    assert.equal(searchSchema.safeParse({ ...base, results }).success, false);
  });

  it("odrzuca wynik z adresem javascript:", () => {
    const results = [{ ...candidate, sourceUrl: "javascript:alert(1)" }];
    assert.equal(searchSchema.safeParse({ ...base, results }).success, false);
  });
});

describe("projekt (projectSchema, cleanLinks)", () => {
  const base = { title: "Projekt", description: "Opis", linkUrls: [] };

  it("wymaga tytułu i opisu", () => {
    assert.equal(projectSchema.safeParse(base).success, true);
    assert.equal(projectSchema.safeParse({ ...base, title: "ab" }).success, false);
    assert.equal(projectSchema.safeParse({ ...base, description: "" }).success, false);
  });

  it("akceptuje tylko linki http(s)", () => {
    assert.equal(
      projectSchema.safeParse({ ...base, linkUrls: ["https://example.com"] }).success,
      true,
    );
    assert.equal(
      projectSchema.safeParse({ ...base, linkUrls: ["javascript:alert(1)"] }).success,
      false,
    );
  });

  it("cleanLinks usuwa puste i duplikaty oraz tnie do 3", () => {
    const links = [
      "",
      "https://a.pl",
      "https://a.pl",
      "https://b.pl",
      "https://c.pl",
      "https://d.pl",
    ];
    assert.deepEqual(cleanLinks(links), ["https://a.pl", "https://b.pl", "https://c.pl"]);
  });
});

describe("organizacja (NIP)", () => {
  it("normalizeNip usuwa spacje i myślniki", () => {
    assert.equal(normalizeNip("123-456 32-18"), "1234563218");
  });

  it("wymaga 10 cyfr", () => {
    const base = {
      name: "Firma",
      nip: "123-456-32-18",
      industry: "",
      street: "Prosta 1",
      postalCode: "00-001",
      city: "Warszawa",
      website: "",
    };
    assert.equal(businessSchema.safeParse(base).success, true);
    assert.equal(businessSchema.safeParse({ ...base, nip: "12345" }).success, false);
  });
});

describe("limit wyników i zapytań do wyszukiwarki", () => {
  it("im wyższy limit, tym więcej zapytań (3, 4, 5)", () => {
    assert.deepEqual([1, 3, 4, 6, 7, 9].map(webSearchesFor), [3, 3, 4, 4, 5, 5]);
  });
});

describe("TRL: pusty wynik to TRL 2", () => {
  it("effectiveTrl podstawia wartość domyślną", () => {
    assert.equal(DEFAULT_TRL, 2);
    assert.equal(effectiveTrl(null), 2);
    assert.equal(effectiveTrl(undefined), 2);
    assert.equal(effectiveTrl(7), 7);
  });

  it("rozpiętość liczy puste oceny jako TRL 2", () => {
    assert.deepEqual(trlRange([6, null, 4]), { min: 2, max: 6 });
    assert.deepEqual(trlRange([null]), { min: 2, max: 2 });
    assert.equal(trlRange([]), null);
  });

  it("formatowanie rozpiętości", () => {
    assert.equal(formatTrlRange({ min: 3, max: 7 }), "TRL 3–7");
    assert.equal(formatTrlRange({ min: 5, max: 5 }), "TRL 5");
    assert.equal(formatTrlRange(null), "brak wyników");
  });
});

describe("raport zbiorczy projektu", () => {
  const result = (id: string, trl: number | null, sourceName = "NCBiR") => ({
    id,
    title: `Wynik ${id}`,
    sourceName,
    trl,
  });

  it("podsumowanie aspektu: rozpiętość, średnia, źródła, grupy dojrzałości, najlepszy wynik", () => {
    const summary = summarizeAspect([result("a", 3), result("b", null, "RAD-on"), result("c", 8)]);
    assert.equal(summary.count, 3);
    assert.deepEqual(summary.range, { min: 2, max: 8 });
    assert.equal(summary.average, (3 + 2 + 8) / 3);
    assert.equal(summary.rated, 2);
    assert.deepEqual(summary.sources, ["NCBiR", "RAD-on"]);
    assert.deepEqual(summary.bands, { research: 2, prototype: 0, deployment: 1 });
    assert.equal(summary.best?.id, "c");
  });

  it("podsumowanie pustego aspektu", () => {
    const summary = summarizeAspect([]);
    assert.equal(summary.count, 0);
    assert.equal(summary.range, null);
    assert.equal(summary.average, null);
    assert.equal(summary.best, null);
  });

  it("rekomenduje aspekt z najwyższym TRL w wynikach", () => {
    const next = pickNextStep([
      { id: "A1", number: 1, results: [result("x", 4), result("y", 5)] },
      { id: "A2", number: 2, results: [result("z", 7)] },
      { id: "A3", number: 3, results: [] },
    ]);
    assert.equal(next?.aspect.id, "A2");
    assert.equal(next?.maxTrl, 7);
    assert.equal(next?.onlyAssumed, false);
  });

  it("remis: więcej wyników na najwyższym poziomie, potem niższy numer aspektu", () => {
    const more = pickNextStep([
      { id: "A1", number: 1, results: [result("x", 6)] },
      { id: "A2", number: 2, results: [result("y", 6), result("z", 6)] },
    ]);
    assert.equal(more?.aspect.id, "A2");
    const first = pickNextStep([
      { id: "A2", number: 2, results: [result("y", 6)] },
      { id: "A1", number: 1, results: [result("x", 6)] },
    ]);
    assert.equal(first?.aspect.id, "A1");
  });

  it("brak wyników = brak rekomendacji; same puste TRL = rekomendacja orientacyjna", () => {
    assert.equal(pickNextStep([{ id: "A1", number: 1, results: [] }]), null);
    const assumed = pickNextStep([{ id: "A1", number: 1, results: [result("x", null)] }]);
    assert.equal(assumed?.maxTrl, 2);
    assert.equal(assumed?.onlyAssumed, true);
  });
});

describe("nazwa pliku raportu", () => {
  it("Projekt + tytuł + znacznik czasu", () => {
    const name = reportFileName("Recykling baterii", new Date(2026, 10, 22, 14, 5, 9));
    assert.equal(name, "Projekt_Recykling_baterii_2026-11-22_14-05-09");
  });

  it("usuwa znaki niedozwolone w nazwach plików i skraca długie tytuły", () => {
    const name = reportFileName('A/B: "test"?*', new Date(2026, 0, 2, 3, 4, 5));
    assert.equal(name, "Projekt_AB_test_2026-01-02_03-04-05");
    assert.ok(reportFileName("x".repeat(200), new Date()).length < 100);
    assert.match(reportFileName("///", new Date(2026, 0, 2, 3, 4, 5)), /^Projekt_raport_/);
  });
});

describe("numeracja", () => {
  it("nazwa aspektu: tytuł albo numer dla starych wpisów", () => {
    assert.equal(aspectTitle("Odzysk metali", 2), "Odzysk metali");
    assert.equal(aspectTitle(null, 3), "Aspekt A3");
    assert.equal(aspectTitle(undefined, 0), "Aspekt bez tytułu");
  });

  it("numer projektu używa czasu polskiego", () => {
    // 2026-11-22 13:30:12 UTC = 14:30:12 w Warszawie (czas zimowy)
    assert.equal(projectNumber(new Date("2026-11-22T13:30:12Z")), "PRJ-20261122-143012");
  });

  it("etykieta aspektu", () => {
    const created = new Date("2026-11-22T13:30:12Z");
    assert.equal(aspectLabel(3, created), "PRJ-20261122-143012/A3");
    assert.equal(aspectLabel(2), "A2");
    assert.equal(aspectLabel(0, created), null);
  });
});
