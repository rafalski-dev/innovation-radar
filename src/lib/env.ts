import { z } from "zod";

// Jedno miejsce na zmienne środowiskowe. Nowa zmienna: dopisz ją tutaj i do .env.example.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "Brak DATABASE_URL (connection string z Neona)"),
  ANTHROPIC_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Niepoprawne zmienne środowiskowe (.env):\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;
