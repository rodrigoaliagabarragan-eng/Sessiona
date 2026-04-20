import { z } from "zod";

export const availabilityRuleSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora de inicio inválida."),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora de fin inválida."),
  slotDurationMinutes: z.coerce.number().int().min(25).max(120)
}).refine((value) => value.startTime < value.endTime, {
  path: ["endTime"],
  message: "La hora de fin debe ser posterior a la de inicio."
});
