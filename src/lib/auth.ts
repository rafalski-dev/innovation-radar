import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { env } from "@/lib/env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  // Logowanie możliwe dopiero po potwierdzeniu e-maila; przy próbie logowania wysyłamy link ponownie.
  emailAndPassword: { enabled: true, minPasswordLength: 8, requireEmailVerification: true },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // bez await: nie blokuje odpowiedzi i chroni przed timing attackiem
      void sendVerificationEmail(user.email, user.name, url).catch(console.error);
    },
  },
  user: {
    additionalFields: {
      // Rola nadawana tylko przez serwer (domyślnie USER); klient nie może jej ustawić.
      // Role administracyjne będą nadawane w panelu administracji.
      role: { type: "string", required: false, defaultValue: "USER", input: false },
      firstName: { type: "string", required: false, input: true },
      lastName: { type: "string", required: false, input: true },
    },
  },
  databaseHooks: {
    user: {
      update: {
        // roli nie zmienia się przez updateUser
        before: async (data) => ({ data: { ...data, role: undefined } }),
      },
    },
  },
  plugins: [nextCookies()], // musi być ostatni
});
