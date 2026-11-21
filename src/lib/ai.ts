import { anthropic } from "@ai-sdk/anthropic";
import { groq } from "@ai-sdk/groq";

// Modele AI w jednym miejscu. Klucze: ANTHROPIC_API_KEY / GROQ_API_KEY w .env.
// Użycie: generateText({ model: models.default, prompt }) z pakietu "ai".
export const models = {
  // najlepsza jakość: trudniejsze zadania, analiza, dłuższe teksty
  default: anthropic("claude-opus-5-5"),
  // szybki i tani: klasyfikacja, krótkie odpowiedzi
  fast: anthropic("claude-haiku-5-5"),
};

// Groq: podaj ID modelu z https://console.groq.com/docs/models
export const groqModel = (modelId: string) => groq(modelId);
