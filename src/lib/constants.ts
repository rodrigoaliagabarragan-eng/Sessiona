import { UserRole } from "@prisma/client";
import type { Route } from "next";

export const DEMO_PASSWORD = "Demo1234!";
export const SELF_SERVICE_APPOINTMENT_WINDOW_HOURS = 24;
export const PASSWORD_RESET_EXPIRY_HOURS = 2;
export const MAX_AUDIO_SIZE_BYTES =
  Number(process.env.AUDIO_MAX_SIZE_MB ?? 25) * 1024 * 1024;

export const AUDIO_ALLOWED_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac"
];

export const APP_ROUTES_BY_ROLE: Record<UserRole, Route> = {
  ADMIN: "/app/admin",
  THERAPIST: "/app/therapist",
  PATIENT: "/app/patient"
};

export const WEEKDAY_OPTIONS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" }
];

export const APPOINTMENT_STATUS_LABELS = {
  SCHEDULED: "Programada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistió"
} as const;
