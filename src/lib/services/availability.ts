import { AppointmentStatus } from "@prisma/client";
import { addDays, addMinutes, isAfter, startOfDay } from "date-fns";

type RuleLike = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
};

type AppointmentLike = {
  startsAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
};

export type GeneratedSlot = {
  startsAt: Date;
  endsAt: Date;
  durationMinutes: number;
};

function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function hasOverlap(
  appointments: AppointmentLike[],
  startsAt: Date,
  endsAt: Date
) {
  return appointments.some(
    (appointment) =>
      appointment.status === "SCHEDULED" &&
      appointment.startsAt < endsAt &&
      appointment.endsAt > startsAt
  );
}

export function generateAvailableSlots(params: {
  rules: RuleLike[];
  appointments: AppointmentLike[];
  from?: Date;
  days?: number;
}) {
  const from = params.from ?? new Date();
  const days = params.days ?? 14;
  const slots: GeneratedSlot[] = [];

  for (let offset = 0; offset < days; offset += 1) {
    const currentDay = addDays(startOfDay(from), offset);
    const rules = params.rules.filter(
      (rule) => rule.isActive && rule.dayOfWeek === currentDay.getDay()
    );

    for (const rule of rules) {
      let cursor = combineDateAndTime(currentDay, rule.startTime);
      const endLimit = combineDateAndTime(currentDay, rule.endTime);

      while (isAfter(addMinutes(cursor, rule.slotDurationMinutes), cursor)) {
        const endsAt = addMinutes(cursor, rule.slotDurationMinutes);

        if (endsAt > endLimit) {
          break;
        }

        if (cursor > from && !hasOverlap(params.appointments, cursor, endsAt)) {
          slots.push({
            startsAt: cursor,
            endsAt,
            durationMinutes: rule.slotDurationMinutes
          });
        }

        cursor = endsAt;
      }
    }
  }

  return slots.sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime());
}
