// Dane testowe: npm run db:seed
// Tworzy konto demo i jedną organizację demo (nie nadpisuje istniejących danych).
// Konto demo: demo@radar-innowacji.pl, hasło: DemoRadar2026!  (tylko do lokalnego developmentu)
import "dotenv/config";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const DEMO_EMAIL = "demo@radar-innowacji.pl";
const DEMO_PASSWORD = "DemoRadar2026!";

// Domyślne źródła agenta (dalej zarządza nimi administrator w panelu). Dodajemy tylko brakujące.
const DEFAULT_SOURCES = [
  { slug: "ncbr", name: "NCBiR", domain: "gov.pl/web/ncbr", description: "projekty B+R" },
  {
    slug: "radon",
    name: "RAD-on",
    domain: "radon.nauka.gov.pl",
    description: "patenty, projekty i instytucje naukowe",
  },
  {
    slug: "mapadotacji",
    name: "Mapa Dotacji UE",
    domain: "mapadotacji.gov.pl",
    description: "projekty z funduszy UE",
  },
  {
    slug: "interreg",
    name: "Interreg",
    domain: "interreg.gov.pl",
    description: "projekty współpracy regionów",
  },
];

async function main() {
  for (const source of DEFAULT_SOURCES) {
    const exists = await db.source.findUnique({ where: { slug: source.slug } });
    if (!exists) {
      await db.source.create({ data: source });
      console.log(`Source: dodano ${source.name}`);
    }
  }

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

  // konto demo jest też administratorem radaru (tylko lokalny development): widzi /dashboard/admin
  if (user.role !== "ADMIN") {
    await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    console.log("User: nadano rolę ADMIN kontu demo");
  }

  // logowanie wymaga potwierdzonego e-maila, a konto demo nie ma prawdziwej skrzynki
  if (!user.emailVerified) {
    await db.user.update({ where: { id: user.id }, data: { emailVerified: true } });
    console.log("User: oznaczono konto demo jako potwierdzone");
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

  // projekty demo: dodajemy tylko brakujące (po tytule), istniejących nie ruszamy
  const demoProjects = [
    {
      title: "Automatyczna kontrola jakości na linii",
      expectedOutcome: "Zmniejszyć liczbę reklamacji o połowę w ciągu roku.",
      description:
        "Szukamy rozwiązania do wizyjnej kontroli detali na taśmie. Budżet do 200 tys. zł, wdrożenie w 6 miesięcy.",
    },
    {
      // temat dobrze pokryty w projektach NCBiR i RAD-on: agent powinien znaleźć wyniki
      title: "Recykling zużytych baterii litowo-jonowych",
      expectedOutcome:
        "Odzyskiwać z zużytych baterii metale (lit, kobalt, nikiel) i ograniczyć odpady.",
      description:
        "Szukamy technologii recyklingu zużytych baterii litowo-jonowych z pojazdów elektrycznych i urządzeń przenośnych. " +
        "Interesuje nas odzysk metali (lit, kobalt, nikiel, mangan) metodami hydrometalurgicznymi lub mechanicznymi oraz " +
        "bezpieczny demontaż ogniw. Chcemy sprawdzić, czy istnieją gotowe projekty badawcze i patenty, które można wdrożyć lub rozwijać z partnerem naukowym.",
    },
    {
      title: "Magazynowanie energii z fotowoltaiki w małym zakładzie produkcyjnym",
      expectedOutcome:
        "Zwiększyć autokonsumpcję energii z własnej instalacji PV i obniżyć rachunki.",
      description:
        "Szukamy rozwiązania do magazynowania energii z instalacji fotowoltaicznej (ok. 200 kWp) w zakładzie produkcyjnym. " +
        "Interesują nas magazyny energii (akumulatory, rozwiązania hybrydowe), systemy zarządzania energią oraz sprawdzone " +
        "projekty badawczo-rozwojowe z tej dziedziny, które można wdrożyć lub rozwijać razem z partnerem naukowym.",
    },
  ];
  for (const project of demoProjects) {
    const exists = await db.project.findFirst({
      where: { businessId: business.id, title: project.title },
      select: { id: true },
    });
    if (exists) {
      console.log(`Project: pominięto (projekt „${project.title}” już istnieje)`);
      continue;
    }
    await db.project.create({ data: { businessId: business.id, ...project } });
    console.log(`Project: dodano projekt demo „${project.title}”`);
  }

  // przykładowy aspekt z wynikami (oznaczone „Przykład”), żeby od razu zobaczyć raport, TRL i liczniki
  const batteryProject = await db.project.findFirst({
    where: { businessId: business.id, title: "Recykling zużytych baterii litowo-jonowych" },
    select: { id: true },
  });
  if (
    batteryProject &&
    (await db.search.count({ where: { projectId: batteryProject.id } })) === 0
  ) {
    await db.search.create({
      data: {
        query: "Recykling zużytych baterii litowo-jonowych",
        projectId: batteryProject.id,
        userId: user.id,
        number: 1,
        status: "DONE",
        startedAt: new Date(),
        phrases: ["recykling baterii litowo-jonowych", "odzysk litu i kobaltu hydrometalurgia"],
        results: {
          create: [
            {
              position: 0,
              title: "Przykład: hydrometalurgiczny odzysk metali z ogniw Li-ion",
              summary:
                "Przykładowy wynik demo. Opisuje projekt badawczy dotyczący odzysku litu i kobaltu.",
              organization: "Przykładowy instytut badawczy",
              sourceName: "NCBiR",
              sourceUrl: "https://www.gov.pl/web/ncbr/przyklad-1",
              why: "Dane demo: pokazuje, jak wygląda wynik z uzasadnieniem.",
              trl: 5,
            },
            {
              position: 1,
              title: "Przykład: mechaniczny demontaż pakietów bateryjnych",
              summary: "Przykładowy wynik demo. Opisuje zautomatyzowany demontaż pakietów baterii.",
              organization: "Przykładowa uczelnia",
              sourceName: "RAD-on",
              sourceUrl: "https://radon.nauka.gov.pl/przyklad-2",
              why: "Dane demo: pokazuje wynik bez oceny TRL.",
              trl: null,
            },
          ],
        },
      },
    });
    console.log("Search: dodano aspekt demo z wynikami");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
