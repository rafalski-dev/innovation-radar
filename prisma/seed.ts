// Dane testowe: npm run db:seed
// Tworzy konto demo (nie nadpisuje istniejącego).
// Konto demo: demo@radar-innowacji.pl, hasło: DemoRadar2026!  (tylko do lokalnego developmentu)
import "dotenv/config";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const DEMO_EMAIL = "demo@radar-innowacji.pl";
const DEMO_PASSWORD = "DemoRadar2026!";

async function main() {
  const existing = await db.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    console.log(`User: pominięto (konto ${DEMO_EMAIL} już istnieje)`);
    return;
  }
  await auth.api.signUpEmail({
    body: {
      name: "Anna Demo",
      firstName: "Anna",
      lastName: "Demo",
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    },
  });
  console.log(`User: utworzono konto demo ${DEMO_EMAIL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
