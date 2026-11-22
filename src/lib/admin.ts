import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getSession, requireRole } from "@/lib/session";

function isAdminEmail(email: string) {
  return (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

// Nadaje rolę ADMIN kontom z ADMIN_EMAILS (jeśli jeszcze jej nie mają). Zwraca, czy użytkownik jest adminem.
export async function ensureAdminRole(userId: string, email: string, role?: string) {
  if (role === "ADMIN") return true;
  if (!isAdminEmail(email)) return false;
  await db.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
  return true;
}

// Strony panelu: nieadmina odsyła na tablicę.
export async function requireAdmin() {
  const session = await getSession();
  if (session) {
    await ensureAdminRole(
      session.user.id,
      session.user.email,
      (session.user as { role?: string }).role,
    );
  }
  return requireRole("ADMIN");
}

// Dla akcji: true, jeśli zalogowany użytkownik jest adminem (bez przekierowania).
export async function isAdminSession() {
  const session = await getSession();
  if (!session) return false;
  return ensureAdminRole(
    session.user.id,
    session.user.email,
    (session.user as { role?: string }).role,
  );
}
