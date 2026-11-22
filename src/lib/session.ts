import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { UserRole } from "@/validation/auth";

// cache(): layout, strona i zapytania w jednym żądaniu dzielą jedno zapytanie o sesję.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

// Dla stron i akcji, które wymagają logowania.
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

// Dla stron i akcji ograniczonych do roli. Nieuprawnionych odsyła na tablicę.
export async function requireRole(...roles: UserRole[]) {
  const session = await requireSession();
  const role = ((session.user as { role?: string }).role ?? "USER") as UserRole;
  if (!roles.includes(role)) redirect("/dashboard");
  return session;
}
