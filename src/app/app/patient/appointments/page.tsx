import { PatientAppointmentActions } from "@/components/forms/patient-appointment-actions";
import { PatientBookingPanel } from "@/components/forms/patient-booking-panel";
import { AppointmentStatusBadge } from "@/components/ui/appointment-status-badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { canPatientModifyAppointment } from "@/lib/services/appointments";
import { formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function PatientAppointmentsPage() {
  const user = await requireRole(["PATIENT"]);
  const patientId = user.patientProfileId!;

  const [links, appointments] = await Promise.all([
    prisma.therapistPatient.findMany({
      where: { patientId },
      include: {
        therapist: {
          include: {
            user: true
          }
        }
      }
    }),
    prisma.appointment.findMany({
      where: { patientId },
      orderBy: { startsAt: "asc" },
      include: {
        therapist: {
          include: {
            user: true
          }
        }
      }
    })
  ]);

  const upcoming = appointments.filter((appointment) => appointment.startsAt >= new Date());
  const history = appointments.filter((appointment) => appointment.startsAt < new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Citas"
        title="Reservas y próximas sesiones"
        description="Consulta tus citas, reserva huecos disponibles y solicita cambios cuando la política del portal lo permita."
      />
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Reservar nueva cita</h2>
          <div className="mt-5">
            {links.length === 0 ? (
              <EmptyState
                title="Sin terapeuta vinculado"
                description="Cuando un profesional vincule tu cuenta, aquí aparecerán sus huecos disponibles."
              />
            ) : (
              <PatientBookingPanel
                therapists={links.map((link) => ({
                  id: link.therapist.id,
                  name: link.therapist.user.fullName
                }))}
              />
            )}
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-ink-900">Próximas citas</h2>
            <div className="mt-5 space-y-4">
              {upcoming.length === 0 ? (
                <EmptyState
                  title="No tienes citas futuras"
                  description="Reserva una nueva cuando tu terapeuta publique disponibilidad."
                />
              ) : (
                upcoming.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-3xl border border-ink-100 bg-white/70 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink-900">
                        {appointment.therapist.user.fullName}
                      </p>
                      <AppointmentStatusBadge status={appointment.status} />
                    </div>
                    <p className="mt-2 text-sm text-ink-600">
                      {formatDateTime(appointment.startsAt)}
                    </p>
                    {appointment.patientMessage ? (
                      <p className="mt-2 text-sm text-ink-600">{appointment.patientMessage}</p>
                    ) : null}
                    <div className="mt-4">
                      <PatientAppointmentActions
                        appointmentId={appointment.id}
                        canModify={canPatientModifyAppointment(appointment.startsAt)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-ink-900">Histórico reciente</h2>
            <div className="mt-5 space-y-4">
              {history.slice(-8).reverse().map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-3xl border border-ink-100 bg-white/70 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink-900">
                      {appointment.therapist.user.fullName}
                    </p>
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>
                  <p className="mt-2 text-sm text-ink-600">
                    {formatDateTime(appointment.startsAt)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
