import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { isEmailBlocked } from "@/lib/blocklist";
import { db } from "@/lib/db";
import { sendResetPasswordEmail, sendVerificationEmail } from "@/lib/email";
import { env } from "@/lib/env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  // Logowanie możliwe dopiero po potwierdzeniu e-maila; przy próbie logowania wysyłamy link ponownie.
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 60, // link do resetu ważny godzinę
    sendResetPassword: async ({ user, url }) => {
      // bez await: nie blokuje odpowiedzi (i nie zdradza, czy konto istnieje, czasem odpowiedzi)
      void sendResetPasswordEmail(user.email, user.name, url).catch(console.error);
    },
  },
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
      create: {
        // czarna lista e-maili z panelu admina blokuje rejestrację
        before: async (user) => {
          if (await isEmailBlocked(user.email)) {
            throw new APIError("BAD_REQUEST", {
              message: "Rejestracja z tego adresu e-mail jest zablokowana",
            });
          }
        },
      },
      update: {
        // roli nie zmienia się przez updateUser
        before: async (data) => ({ data: { ...data, role: undefined } }),
      },
    },
  },
  plugins: [nextCookies()], // musi być ostatni
});
