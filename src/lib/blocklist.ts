import { db } from "@/lib/db";

// Czarna lista e-maili: wpis to pełny adres (jan@x.pl) albo domena z "@" (@x.pl).
export async function isEmailBlocked(email: string) {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.slice(normalized.lastIndexOf("@"));
  const hit = await db.blockedEmail.findFirst({
    where: { pattern: { in: [normalized, domain] } },
    select: { id: true },
  });
  return Boolean(hit);
}

// Czarna lista tematów: zwraca pierwszą zakazaną frazę znalezioną w tekście (bez wielkości liter) albo null.
export async function findBlockedTopic(...texts: (string | null | undefined)[]) {
  const haystack = texts.filter(Boolean).join("\n").toLowerCase();
  if (!haystack) return null;
  const topics = await db.blockedTopic.findMany({ select: { phrase: true } });
  return topics.find((t) => haystack.includes(t.phrase.toLowerCase()))?.phrase ?? null;
}

export const blockedTopicMessage = (phrase: string) =>
  `Temat jest niedozwolony w Radarze innowacji (fraza: „${phrase}”)`;
