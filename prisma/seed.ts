// Dane testowe: npm run db:seed
// Dodaje przykłady tylko do pustej tabeli, więc nie nadpisze Twoich danych.
import "dotenv/config";
import { db } from "@/lib/db";
import type { ItemInput } from "@/validation/item";

const items: ItemInput[] = [
  {
    name: "Pierwszy element",
    description: "Przykładowy opis.",
    status: "ACTIVE",
    priority: "HIGH",
  },
  { name: "Drugi element", description: "", status: "DRAFT", priority: "MEDIUM" },
  { name: "Trzeci element", description: "Już nieaktualny.", status: "ARCHIVED", priority: "LOW" },
];

async function main() {
  const count = await db.item.count();
  if (count > 0) {
    console.log(`Item: pominięto (w tabeli jest już ${count} rekordów)`);
  } else {
    await db.item.createMany({
      data: items.map((item) => ({ ...item, description: item.description || null })),
    });
    console.log(`Item: dodano ${items.length} rekordy`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
