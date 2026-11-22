import { z } from "zod";

// Jedno miejsce na zmienne środowiskowe. Nowa zmienna: dopisz ją tutaj i do .env.example.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "Brak DATABASE_URL (connection string z Neona)"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET: min. 32 znaki (openssl rand -base64 32)"),
  BETTER_AUTH_URL: z
    .string()
    .url("BETTER_AUTH_URL: pełny adres aplikacji, np. http://localhost:3000"),
  ANTHROPIC_API_KEY: z.string().optional(),
  // E-maile administratorów Horyzontu (po przecinku): konto z takim adresem dostaje rolę ADMIN przy wejściu do panelu.
  ADMIN_EMAILS: z.string().optional(),
  // E-mail (Resend). Bez klucza wiadomości trafiają tylko do konsoli serwera.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Horyzont innowacji <contact@rafalski.dev>"),
  // "true" = agent zwraca przykładowych kandydatów bez wywołania API (testy UI za darmo)
  AGENT_MOCK: z.string().optional(),
  // Cloudflare R2 (pliki PDF przy potrzebach). Opcjonalne: bez nich aplikacja działa, a dodawanie plików jest wyłączone.
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    "Niepoprawne zmienne środowiskowe (lokalnie: plik .env, na Vercelu: Settings → Environment Variables):\n" +
      z.prettifyError(parsed.error),
  );
}

export const env = parsed.data;
