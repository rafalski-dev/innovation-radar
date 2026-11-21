import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Imię musi mieć co najmniej 2 znaki").max(100),
  organization: z.string().trim().max(150),
  position: z.string().trim().max(100),
  interests: z.string().trim().max(1000),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Podaj obecne hasło"),
    newPassword: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków").max(128),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    path: ["confirm"],
    message: "Hasła nie są takie same",
  });
export type PasswordInput = z.infer<typeof passwordSchema>;
