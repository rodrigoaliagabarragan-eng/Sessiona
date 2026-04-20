import { AudioUploadForm } from "@/components/forms/audio-upload-form";
import { AppointmentStatusBadge } from "@/components/ui/appointment-status-badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { assertPatientAccess } from "@/lib/permissions";
import { formatDateTime, formatDurationFromSeconds } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function TherapistPatientDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ therapistId?: string }>;
}) {
  const user = await requireRole(["THERAPIST", "ADMIN"]);
  const { therapistId: requestedTherapistId } = await searchParams;
  const therapistId =
    user.role === "ADMIN" ? requestedTherapistId : user.therapistProfileId;
  const { patientId } = await params;

  if (!therapistId) {
    return null;
  }

  await assertPatientAccess(user, patientId);

  const patient = await prisma.patientProfile.findUnique({
    where: { id: patientId },
    include: {
      user: true,
      appointments: {
        where: { therapistId },
        orderBy: { startsAt: "desc" },
        take: 12
      },
      audioSessions: {
        where: { therapistId },
        orderBy: { sessionDate: "desc" },
        take: 12
      }
    }
  });

  if (!patient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ficha del paciente"
        title={patient.user.fullName}
        description={`${patient.user.email} · ${patient.user.phone ?? "Sin teléfono"}`}
      />
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="h-fit p-6">
          <h2 className="text-lg font-semibold text-ink-900">Subir audio de sesión</h2>
          <div className="mt-5">
            <AudioUploadForm
              patientId={patient.id}
              therapistId={therapistId}
              appointments={patient.appointments.map((appointment) => ({
                id: appointment.id,
                label: formatDateTime(appointment.startsAt)
              }))}
            />
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-ink-900">Historial de citas</h2>
            <div className="mt-5 space-y-4">
              {patient.appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-3xl border border-ink-100 bg-white/70 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <AppointmentStatusBadge status={appointment.status} />
                    <p className="text-sm text-ink-600">
                      {formatDateTime(appointment.startsAt)}
                    </p>
                  </div>
                  {appointment.patientMessage ? (
                    <p className="mt-2 text-sm text-ink-600">{appointment.patientMessage}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-ink-900">Audios del paciente</h2>
            <div className="mt-5 space-y-4">
              {patient.audioSessions.map((audio) => (
                <div
                  key={audio.id}
                  className="rounded-3xl border border-ink-100 bg-white/70 p-4"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-ink-900">{audio.title}</p>
                      <p className="text-sm text-ink-600">
                        {formatDateTime(audio.sessionDate)} ·{" "}
                        {formatDurationFromSeconds(audio.durationSeconds)}
                      </p>
                    </div>
                  </div>
                  {audio.notesPrivate ? (
                    <p className="mt-3 text-sm text-ink-600">{audio.notesPrivate}</p>
                  ) : null}
                  <audio
                    className="mt-4 w-full"
                    controls
                    preload="metadata"
                    src={`/api/audio/${audio.id}/stream`}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
