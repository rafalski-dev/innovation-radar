import { z } from "zod";

// Wspólny wynik każdej server action. Formularz sprawdza `result.success`.
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export function ok(): ActionResult<void>;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T | undefined> {
  return { success: true, data };
}

export function fail(error: string): ActionResult<never> {
  return { success: false, error };
}

export function validationError(error: z.ZodError): ActionResult<never> {
  return {
    success: false,
    error: "Popraw błędy w formularzu",
    fieldErrors: z.flattenError(error).fieldErrors,
  };
}
