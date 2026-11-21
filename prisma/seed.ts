// Dane testowe: npm run db:seed
// Tworzy konto demo (USER) i kilka ticketów. Nie nadpisuje istniejących danych.
// Konto demo: demo@radar-innowacji.pl, hasło: DemoRadar2026!  (tylko do lokalnego developmentu)
import "dotenv/config";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { InnovationInput } from "@/validation/innovation";
import type { InnovationStatus } from "@/validation/innovation";

const DEMO_EMAIL = "demo@radar-innowacji.pl";
const DEMO_PASSWORD = "DemoRadar2026!";

const innovations: (InnovationInput & { status: InnovationStatus })[] = [
  {
    title: "Aplikacja do nauki matematyki w klasach 4–6",
    summary: "Mobilna aplikacja z zadaniami dopasowującymi trudność do postępów ucznia.",
    problem:
      "Uczniowie mają bardzo różne tempo nauki, a nauczyciel nie jest w stanie dopasować zadań.",
    solution:
      "Aplikacja adaptacyjna z raportem dla nauczyciela, wdrożona pilotażowo w jednej szkole.",
    type: "EDUCATIONAL",
    stage: "PILOT",
    sector: "EDUCATION",
    sourceUrl: "",
    creators: "Zespół nauczycieli SP nr 5",
    contactEmail: "",
    status: "SUBMITTED",
  },
  {
    title: "E-obsługa wniosków o dowód osobisty",
    summary: "Całkowicie elektroniczny proces umawiania wizyt i składania wniosków w gminie.",
    problem: "Mieszkańcy tracą czas w kolejkach, a urząd nie planuje obłożenia stanowisk.",
    solution: "Jeden formularz online z rezerwacją terminu i przypomnieniem SMS.",
    type: "PROCESS",
    stage: "IMPLEMENTED",
    sector: "ADMINISTRATION",
    sourceUrl: "",
    creators: "",
    contactEmail: "",
    status: "ASSESSED",
  },
  {
    title: "Czujniki jakości powietrza na przystankach",
    summary: "Sieć tanich czujników zasilanych z paneli słonecznych na przystankach autobusowych.",
    problem: "Brak lokalnych danych o jakości powietrza w gminach bez stacji pomiarowych.",
    solution: "Czujniki z publicznym panelem danych i alertami smogowymi.",
    type: "TECHNOLOGICAL",
    stage: "PROTOTYPE",
    sector: "ENVIRONMENT",
    sourceUrl: "",
    creators: "",
    contactEmail: "",
    status: "RECOMMENDED",
  },
  {
    title: "Wspólny kalendarz wydarzeń szkół i uczelni",
    summary: "Jeden kalendarz łączący warsztaty i dni otwarte instytucji z regionu.",
    problem: "Wydarzenia są rozproszone, a uczniowie rzadko o nich wiedzą.",
    solution: "Wspólna platforma z automatycznym importem wydarzeń.",
    type: "SOCIAL",
    stage: "IDEA",
    sector: "NONE",
    sourceUrl: "",
    creators: "",
    contactEmail: "",
    status: "ARCHIVED",
  },
];

async function main() {
  let user = await db.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    await auth.api.signUpEmail({
      body: { name: "Anna Demo", email: DEMO_EMAIL, password: DEMO_PASSWORD },
    });
    user = await db.user.findUniqueOrThrow({ where: { email: DEMO_EMAIL } });
    console.log(`User: utworzono konto demo ${DEMO_EMAIL}`);
  }

  const count = await db.innovation.count({ where: { authorId: user.id } });
  if (count > 0) {
    console.log(`Innovation: pominięto (konto demo ma już ${count} ticketów)`);
    return;
  }
  for (const { sector, sourceUrl, creators, contactEmail, ...rest } of innovations) {
    await db.innovation.create({
      data: {
        ...rest,
        sector: sector === "NONE" ? null : sector,
        sourceUrl: sourceUrl || null,
        creators: creators || null,
        contactEmail: contactEmail || null,
        authorId: user.id,
      },
    });
  }
  console.log(`Innovation: dodano ${innovations.length} tickety`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
