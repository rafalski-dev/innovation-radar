// Dane testowe: npm run db:seed
// Tworzy konto demo i jedną organizację demo (nie nadpisuje istniejących danych).
// Konto demo: demo@radar-innowacji.pl, hasło: DemoRadar2026!  (tylko do lokalnego developmentu)
import "dotenv/config";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const DEMO_EMAIL = "demo@radar-innowacji.pl";
const DEMO_PASSWORD = "DemoRadar2026!";

async function main() {
  let user = await db.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    await auth.api.signUpEmail({
      body: {
        name: "Anna Demo",
        firstName: "Anna",
        lastName: "Demo",
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      },
    });
    user = await db.user.findUniqueOrThrow({ where: { email: DEMO_EMAIL } });
    console.log(`User: utworzono konto demo ${DEMO_EMAIL}`);
  } else {
    console.log(`User: pominięto (konto ${DEMO_EMAIL} już istnieje)`);
  }

  let business = await db.business.findFirst({ where: { ownerId: user.id } });
  if (!business) {
    business = await db.business.create({
      data: {
        name: "Januszex Sp. z o.o.",
        nip: "5260250995",
        industry: "Produkcja",
        street: "ul. Przemysłowa 12",
        postalCode: "35-001",
        city: "Rzeszów",
        description: "Średnia firma produkcyjna szukająca rozwiązań do automatyzacji linii.",
        ownerId: user.id,
      },
    });
    console.log("Business: dodano organizację demo");
  } else {
    console.log("Business: pominięto (konto demo ma już organizację)");
  }

  const needs = await db.need.count({ where: { businessId: business.id } });
  if (needs > 0) {
    console.log(`Need: pominięto (organizacja demo ma już ${needs} projektów)`);
    return;
  }
  await db.need.create({
    data: {
      businessId: business.id,
      title: "Automatyczna kontrola jakości na linii",
      expectedOutcome: "Zmniejszyć liczbę reklamacji o połowę w ciągu roku.",
      description:
        "Szukamy rozwiązania do wizyjnej kontroli detali na taśmie. Budżet do 200 tys. zł, wdrożenie w 6 miesięcy.",
    },
  });
  console.log("Need: dodano projekt demo");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
