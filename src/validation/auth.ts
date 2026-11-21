import { z } from "zod";

export const USER_ROLES = ["USER", "OFFICIAL", "BUSINESS"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const userRoleLabels: Record<UserRole, string> = {
  USER: "Użytkownik",
  OFFICIAL: "Urzędnik",
  BUSINESS: "Reprezentant biznesu",
};

export const roleDescriptions: Record<UserRole, string> = {
  USER: "Zgłaszam pomysły innowacji i śledzę ich status. Dla osób prywatnych, nauczycieli, pracowników szkół, uczelni i samorządów.",
  OFFICIAL:
    "Sprawdzam i oceniam zgłoszone pomysły w imieniu instytucji oraz prowadzę je przez kolejne etapy procesu.",
  BUSINESS:
    "Szukam gotowych rozwiązań i innowacji dla swojej firmy oraz zgłaszam zapotrzebowanie na nowe technologie.",
};

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Podaj e-mail").email("Niepoprawny adres e-mail"),
  password: z.string().min(1, "Podaj hasło"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Imię musi mieć co najmniej 2 znaki").max(100),
    email: z.string().trim().min(1, "Podaj e-mail").email("Niepoprawny adres e-mail"),
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków").max(128),
    role: z.enum(USER_ROLES, { error: "Wybierz, kim jesteś" }),
    // pola zależne od roli (patrz superRefine)
    organization: z.string().trim().max(150),
    position: z.string().trim().max(100),
    interests: z.string().trim().max(1000),
  })
  .superRefine((data, ctx) => {
    if (data.role === "OFFICIAL") {
      if (!data.organization)
        ctx.addIssue({ code: "custom", path: ["organization"], message: "Podaj instytucję" });
      if (!data.position)
        ctx.addIssue({ code: "custom", path: ["position"], message: "Podaj stanowisko" });
    }
    if (data.role === "BUSINESS" && !data.organization) {
      ctx.addIssue({ code: "custom", path: ["organization"], message: "Podaj nazwę firmy" });
    }
  });
export type RegisterInput = z.infer<typeof registerSchema>;
