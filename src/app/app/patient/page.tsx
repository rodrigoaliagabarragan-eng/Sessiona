import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { requireRole } from "@/lib/auth";
import { formatDateTime, formatDurationFromSeconds } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function PatientDashboardPage() {
  const user = await requireRole(["PATIENT"]);
  const patientId = user.patientProfileId!;

  const [nextAppointment, sessionCount, linkedTherapists, recentSessions] =
    await Promise.all([
      prisma.appointment.findFirst({
        where: {
          patientId,
          startsAt: { gte: new Date() },
          status: "SCHEDULED"
        },
        orderBy: { startsAt: "asc" },
        include: {
          therapist: {
            include: { user: true }
          }
        }
      }),
      prisma.audioSession.count({
        where: { patientId }
      }),
      prisma.therapistPatient.count({
        where: { patientId }
      }),
      prisma.audioSession.findMany({
        where: { patientId },
        take: 4,
        orderBy: { sessionDate: "desc" },
        include: {
          therapist: {
            include: { user: true }
          }
        }
      })
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Portal privado"
        title="Tu espacio personal"
        description="Consulta tus próximas sesiones, revisa tus audios y reserva nuevos huecos cuando estén disponibles."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Próxima cita"
          value={nextAppointment ? formatDateTime(nextAppointment.startsAt, "d MMM") : "Sin cita"}
          helper={nextAppointment ? formatDateTime(nextAppointment.startsAt, "HH:mm") : undefined}
        />
        <StatCard label="Sesiones de audio" value={sessionCount} />
        <StatCard label="Profesionales vinculados" value={linkedTherapists} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink-900">Próxima cita</h2>
            <Link className="text-sm font-semibold text-ink-700 underline" href="/app/patient/appointments">
              Gestionar
            </Link>
          </div>
          <div className="mt-5">
            {nextAppointment ? (
              <div className="rounded-3xl border border-ink-100 bg-white/70 p-4">
                <p className="font-semibold text-ink-900">
                  {nextAppointment.therapist.user.fullName}
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  {formatDateTime(nextAppointment.startsAt)}
                </p>
              </div>
            ) : (
              <EmptyState
                title="No tienes una próxima cita"
                description="Si tu terapeuta ha publicado huecos, puedes reservar desde la sección de citas."
                ctaHref="/app/patient/appointments"
                ctaLabel="Ver huecos"
              />
            )}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink-900">Últimas sesiones</h2>
            <Link className="text-sm font-semibold text-ink-700 underline" href="/app/patient/sessions">
              Ver biblioteca
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {recentSessions.length === 0 ? (
              <EmptyState
                title="Aún no tienes audios"
                description="Cuando tu terapeuta suba una sesión, aparecerá aquí para reproducirla en streaming."
              />
            ) : (
              recentSessions.map((audio) => (
                <Link
                  key={audio.id}
                  href={`/app/patient/sessions/${audio.id}`}
                  className="block rounded-3xl border border-ink-100 bg-white/70 p-4 transition hover:border-accent"
                >
                  <p className="font-semibold text-ink-900">{audio.title}</p>
                  <p className="mt-1 text-sm text-ink-600">
                    {formatDateTime(audio.sessionDate)} ·{" "}
                    {formatDurationFromSeconds(audio.durationSeconds)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
