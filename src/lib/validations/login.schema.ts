import * as z from "zod";

export const LoginSchema = z.object({
  email: z
    .email({ pattern: z.regexes.email })
    .trim()
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Password harus 8-64 karakter")
    .max(64, "Password harus 8-64 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
    .regex(/[0-9]/, "Password harus mengandung minimal 1 angka")
    .regex(
      /[^A-Za-z0-9]/,
      "Password harus mengandung minimal 1 karakter spesial",
    ),
});
