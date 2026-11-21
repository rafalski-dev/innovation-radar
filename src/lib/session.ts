import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

// Dla stron i akcji, które wymagają logowania.
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
