import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  user: {
    additionalFields: {
      // Rola wybierana przy rejestracji (prototyp: bez weryfikacji urzędników i firm).
      role: { type: "string", required: false, defaultValue: "USER", input: true },
      organization: { type: "string", required: false, input: true },
      position: { type: "string", required: false, input: true },
      interests: { type: "string", required: false, input: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Walidacja po stronie serwera: pola wymagane zależą od roli.
        before: async (user) => {
          const u = user as { role?: string; organization?: string; position?: string };
          if (u.role && !["USER", "OFFICIAL", "BUSINESS"].includes(u.role)) {
            throw new APIError("BAD_REQUEST", { message: "Niepoprawna rola" });
          }
          if (u.role === "OFFICIAL" && (!u.organization?.trim() || !u.position?.trim())) {
            throw new APIError("BAD_REQUEST", { message: "Podaj instytucję i stanowisko" });
          }
          if (u.role === "BUSINESS" && !u.organization?.trim()) {
            throw new APIError("BAD_REQUEST", { message: "Podaj nazwę firmy" });
          }
        },
      },
    },
  },
  plugins: [nextCookies()], // musi być ostatni
});
