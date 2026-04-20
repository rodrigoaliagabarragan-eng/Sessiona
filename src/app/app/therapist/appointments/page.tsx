import Link from "next/link";
import { AppointmentStatus } from "@prisma/client";
import { TherapistAppointmentCancelButton } from "@/components/forms/therapist-appointment-cancel-button";
import { TherapistAppointmentForm } from "@/components/forms/therapist-appointment-form";
import { AppointmentStatusBadge } from "@/components/ui/appointment-status-badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function TherapistAppointmentsPage({
  searchParams
}: {
  searchParams: Promise<{ edit?: string; therapistId?: string }>;
}) {
  const user = await requireRole(["THERAPIST", "ADMIN"]);
  const { edit, therapistId: requestedTherapistId } = await searchParams;
  const therapistId =
    user.role === "ADMIN" ? requestedTherapistId : user.therapistProfileId;

  if (!therapistId) {
    return (
      <EmptyState
        title="Selecciona un terapeuta"
        description="Abre la agenda desde el panel de administración para trabajar sobre un profesional concreto."
        ctaHref="/app/admin"
        ctaLabel="Volver al admin"
      />
    );
  }

  const scopedHref = (path: string) =>
    user.role === "ADMIN"
      ? `${path}${path.includes("?") ? "&" : "?"}therapistId=${therapistId}`
      : path;

  const [patients, appointments] = await Promise.all([
    prisma.therapistPatient.findMany({
      where: { therapistId },
      orderBy: { assignedAt: "asc" },
      include: {
        patient: {
          include: { user: true }
        }
      }
    }),
    prisma.appointment.findMany({
      where: { therapistId },
      orderBy: { startsAt: "asc" },
      include: {
        patient: {
          include: { user: true }
        }
      }
    })
  ]);

  const selectedAppointment = appointments.find((appointment) => appointment.id === edit);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Agenda"
        title="Citas y agenda"
        description="Crea, edita y cancela citas, manteniendo el control de huecos y evitando solapamientos."
      />
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="h-fit p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink-900">
              {selectedAppointment ? "Editar cita" : "Nueva cita"}
            </h2>
            {selectedAppointment ? (
              <Link
                className="text-sm font-semibold text-ink-700 underline"
                href={scopedHref("/app/therapist/appointments")}
              >
                Limpiar
              </Link>
            ) : null}
          </div>
          <div className="mt-5">
            {patients.length === 0 ? (
              <EmptyState
                title="No hay pacientes vinculados"
                description="Primero crea o vincula al menos un paciente desde la pestaña de pacientes."
                ctaHref={scopedHref("/app/therapist/patients")}
                ctaLabel="Ir a pacientes"
              />
            ) : (
              <TherapistAppointmentForm
                patients={patients.map((item) => ({
                  id: item.patient.id,
                  name: item.patient.user.fullName
                }))}
                therapistId={therapistId}
                appointment={
                  selectedAppointment
                    ? {
                        id: selectedAppointment.id,
                        patientId: selectedAppointment.patientId,
                        startsAt: selectedAppointment.startsAt.toISOString(),
                        durationMinutes:
                          (selectedAppointment.endsAt.getTime() -
                            selectedAppointment.startsAt.getTime()) /
                          60000,
                        status: selectedAppointment.status as AppointmentStatus,
                        patientMessage: selectedAppointment.patientMessage
                      }
                    : null
                }
              />
            )}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Listado de citas</h2>
          <div className="mt-5 space-y-4">
            {appointments.length === 0 ? (
              <EmptyState
                title="Agenda vacía"
                description="Crea tu primera cita o publica disponibilidad para que el paciente reserve."
              />
            ) : (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-3xl border border-ink-100 bg-white/70 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-ink-900">
                          {appointment.patient.user.fullName}
                        </p>
                        <AppointmentStatusBadge status={appointment.status} />
                        {appointment.rescheduleRequestedAt ? (
                          <span className="rounded-full bg-rose/25 px-3 py-1 text-xs font-semibold text-ink-900">
                            Cambio solicitado
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-ink-600">
                        {formatDateTime(appointment.startsAt)}
                      </p>
                      {appointment.patientMessage ? (
                        <p className="text-sm text-ink-600">{appointment.patientMessage}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="rounded-full bg-ink-100 px-4 py-2 text-sm font-medium text-ink-900"
                        href={scopedHref(`/app/therapist/appointments?edit=${appointment.id}`)}
                      >
                        Editar
                      </Link>
                      {appointment.status === "SCHEDULED" ? (
                        <TherapistAppointmentCancelButton appointmentId={appointment.id} />
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
