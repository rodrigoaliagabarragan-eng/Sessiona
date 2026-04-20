import { z } from "zod";
import { cleanMultilineText, cleanSingleLineText } from "@/lib/text";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(64, "La contraseña es demasiado larga.")
  .regex(/[A-Z]/, "Incluye al menos una letra mayúscula.")
  .regex(/[a-z]/, "Incluye al menos una letra minúscula.")
  .regex(/\d/, "Incluye al menos un número.");

export const loginSchema = z.object({
  email: z.string().email("Introduce un email válido.").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, "La contraseña es obligatoria.")
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Introduce tu nombre completo.")
      .max(100, "El nombre es demasiado largo.")
      .transform(cleanSingleLineText),
    email: z.string().email("Introduce un email válido.").transform((value) => value.trim().toLowerCase()),
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden."
  });

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Introduce un email válido.").transform((value) => value.trim().toLowerCase())
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16, "Token inválido."),
  password: passwordSchema,
  confirmPassword: z.string(),
  note: z
    .string()
    .max(400, "El texto es demasiado largo.")
    .optional()
    .transform((value) => (value ? cleanMultilineText(value) : undefined))
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Las contraseñas no coinciden."
});
