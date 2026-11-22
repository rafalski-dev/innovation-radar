import { z } from "zod";

export const USER_ROLES = ["USER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const userRoleLabels: Record<UserRole, string> = {
  USER: "Użytkownik",
  ADMIN: "Administrator Horyzontu",
};

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Podaj e-mail").email("Niepoprawny adres e-mail"),
  password: z.string().min(1, "Podaj hasło"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "Imię musi mieć co najmniej 2 znaki").max(50),
    lastName: z.string().trim().min(2, "Nazwisko musi mieć co najmniej 2 znaki").max(50),
    email: z.string().trim().min(1, "Podaj e-mail").email("Niepoprawny adres e-mail"),
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków").max(128),
    confirmPassword: z.string().min(1, "Powtórz hasło"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być takie same",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Podaj e-mail").email("Niepoprawny adres e-mail"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków").max(128),
    confirm: z.string().min(1, "Powtórz hasło"),
  })
  .refine((d) => d.newPassword === d.confirm, {
    path: ["confirm"],
    message: "Hasła muszą być takie same",
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
