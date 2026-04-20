import { AppointmentStatus } from "@prisma/client";
import { addMinutes } from "date-fns";
import { z } from "zod";
import { cleanMultilineText } from "@/lib/text";

export const therapistAppointmentSchema = z
  .object({
    id: z.string().optional(),
    patientId: z.string().min(1, "Selecciona un paciente."),
    startsAt: z.string().min(1, "Selecciona fecha y hora."),
    durationMinutes: z.coerce.number().int().min(25).max(120),
    status: z.nativeEnum(AppointmentStatus).optional(),
    patientMessage: z
      .string()
      .max(500)
      .optional()
      .transform((value) => (value ? cleanMultilineText(value) : undefined))
  })
  .transform((value) => {
    const startsAt = new Date(value.startsAt);
    const endsAt = addMinutes(startsAt, value.durationMinutes);
    return {
      ...value,
      startsAt,
      endsAt
    };
  })
  .refine((value) => !Number.isNaN(value.startsAt.getTime()), {
    path: ["startsAt"],
    message: "La fecha de inicio no es válida."
  });

export const patientBookAppointmentSchema = z.object({
  therapistId: z.string().min(1),
  startsAt: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(25).max(120)
});

export const cancelAppointmentSchema = z.object({
  cancellationReason: z
    .string()
    .max(250)
    .optional()
    .transform((value) => (value ? cleanMultilineText(value) : undefined))
});

export const rescheduleRequestSchema = z.object({
  patientMessage: z
    .string()
    .min(6, "Describe brevemente el motivo.")
    .max(500)
    .transform(cleanMultilineText)
});
