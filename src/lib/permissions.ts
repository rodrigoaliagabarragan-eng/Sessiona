import { UserRole } from "@prisma/client";
import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  role: UserRole;
  therapistProfileId?: string | null;
  patientProfileId?: string | null;
};

export async function assertPatientAccess(user: SessionUser, patientId: string) {
  if (user.role === "ADMIN") {
    return;
  }

  if (user.role === "PATIENT" && user.patientProfileId === patientId) {
    return;
  }

  if (user.role === "THERAPIST" && user.therapistProfileId) {
    const link = await prisma.therapistPatient.findUnique({
      where: {
        therapistId_patientId: {
          therapistId: user.therapistProfileId,
          patientId
        }
      }
    });

    if (link) {
      return;
    }
  }

  throw new ApiError(403, "No tienes permisos para acceder a este paciente.");
}

export async function assertTherapistAccess(
  user: SessionUser,
  therapistId: string
) {
  if (user.role === "ADMIN") {
    return;
  }

  if (user.role === "THERAPIST" && user.therapistProfileId === therapistId) {
    return;
  }

  if (user.role === "PATIENT" && user.patientProfileId) {
    const link = await prisma.therapistPatient.findUnique({
      where: {
        therapistId_patientId: {
          therapistId,
          patientId: user.patientProfileId
        }
      }
    });

    if (link) {
      return;
    }
  }

  throw new ApiError(403, "No tienes permisos para acceder a este profesional.");
}

export async function assertAppointmentAccess(
  user: SessionUser,
  appointmentId: string
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  });

  if (!appointment) {
    throw new ApiError(404, "La cita no existe.");
  }

  if (user.role === "ADMIN") {
    return appointment;
  }

  if (
    user.role === "THERAPIST" &&
    user.therapistProfileId === appointment.therapistId
  ) {
    return appointment;
  }

  if (user.role === "PATIENT" && user.patientProfileId === appointment.patientId) {
    return appointment;
  }

  throw new ApiError(403, "No puedes acceder a esta cita.");
}
