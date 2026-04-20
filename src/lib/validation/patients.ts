import { z } from "zod";
import { cleanMultilineText, cleanSingleLineText } from "@/lib/text";

export const createPatientSchema = z.object({
  fullName: z.string().min(3).max(100).transform(cleanSingleLineText),
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  phone: z.string().max(30).optional().transform((value) => value?.trim() || undefined),
  dateOfBirth: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined)),
  notes: z
    .string()
    .max(500)
    .optional()
    .transform((value) => (value ? cleanMultilineText(value) : undefined))
});
