import { AppointmentStatus, Prisma } from "@prisma/client";
import { addHours } from "date-fns";
import { SELF_SERVICE_APPOINTMENT_WINDOW_HOURS } from "@/lib/constants";
import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function ensureAppointmentSlotAvailable(params: {
  therapistId: string;
  startsAt: Date;
  endsAt: Date;
  excludeAppointmentId?: string;
}) {
  const overlapping = await prisma.appointment.findFirst({
    where: {
      therapistId: params.therapistId,
      status: AppointmentStatus.SCHEDULED,
      id: params.excludeAppointmentId ? { not: params.excludeAppointmentId } : undefined,
      startsAt: { lt: params.endsAt },
      endsAt: { gt: params.startsAt }
    }
  });

  if (overlapping) {
    throw new ApiError(409, "Ese hueco ya está reservado.");
  }
}

export function canPatientModifyAppointment(startsAt: Date) {
  return startsAt > addHours(new Date(), SELF_SERVICE_APPOINTMENT_WINDOW_HOURS);
}

export async function upsertAppointment(params: {
  appointmentId?: string;
  therapistId: string;
  patientId: string;
  createdByUserId: string;
  startsAt: Date;
  endsAt: Date;
  patientMessage?: string | null;
  status?: AppointmentStatus;
}) {
  return prisma.$transaction(
    async (tx) => {
      const conflict = await tx.appointment.findFirst({
        where: {
          therapistId: params.therapistId,
          status: AppointmentStatus.SCHEDULED,
          id: params.appointmentId ? { not: params.appointmentId } : undefined,
          startsAt: { lt: params.endsAt },
          endsAt: { gt: params.startsAt }
        }
      });

      if (conflict) {
        throw new ApiError(409, "Ese hueco ya está ocupado.");
      }

      if (params.appointmentId) {
        return tx.appointment.update({
          where: { id: params.appointmentId },
          data: {
            patientId: params.patientId,
            startsAt: params.startsAt,
            endsAt: params.endsAt,
            patientMessage: params.patientMessage,
            status: params.status ?? AppointmentStatus.SCHEDULED
          }
        });
      }

      return tx.appointment.create({
        data: {
          therapistId: params.therapistId,
          patientId: params.patientId,
          createdByUserId: params.createdByUserId,
          startsAt: params.startsAt,
          endsAt: params.endsAt,
          patientMessage: params.patientMessage,
          status: params.status ?? AppointmentStatus.SCHEDULED
        }
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    }
  );
}
