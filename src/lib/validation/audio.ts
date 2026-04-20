import { z } from "zod";
import { cleanMultilineText, cleanSingleLineText } from "@/lib/text";

export const uploadAudioSchema = z.object({
  patientId: z.string().min(1, "Selecciona un paciente."),
  appointmentId: z.string().optional(),
  title: z.string().min(3).max(120).transform(cleanSingleLineText),
  sessionDate: z.string().min(1, "Selecciona la fecha de la sesión."),
  durationSeconds: z.coerce.number().int().min(30).max(60 * 60 * 4),
  notesPrivate: z
    .string()
    .max(5000)
    .optional()
    .transform((value) => (value ? cleanMultilineText(value) : undefined))
});
