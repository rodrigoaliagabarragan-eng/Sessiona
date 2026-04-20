import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function TherapistDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ therapistId?: string }>;
}) {
  const user = await requireRole(["THERAPIST", "ADMIN"]);
  const { therapistId: requestedTherapistId } = await searchParams;
  const therapistId =
    user.role === "ADMIN" ? requestedTherapistId : user.therapistProfileId;

  if (!therapistId) {
    return (
      <EmptyState
        title="Selecciona un terapeuta"
        description="Desde el panel de administración puedes abrir el espacio de trabajo de cualquier profesional."
        ctaHref="/app/admin"
        ctaLabel="Volver al admin"
      />
    );
  }

  const therapist = await prisma.therapistProfile.findUnique({
    where: { id: therapistId },
    include: { user: true }
  });

  if (!therapist) {
    return null;
  }

  const scopedHref = (path: string) =>
    user.role === "ADMIN" ? `${path}?therapistId=${therapistId}` : path;

  const [patientCount, upcomingAppointments, recentAudios] = await Promise.all([
    prisma.therapistPatient.count({
      where: { therapistId }
    }),
    prisma.appointment.findMany({
      where: {
        therapistId,
        status: "SCHEDULED",
        startsAt: { gte: new Date() }
      },
      take: 5,
      orderBy: { startsAt: "asc" },
      include: {
        patient: {
          include: {
            user: true
          }
        }
      }
    }),
    prisma.audioSession.findMany({
      where: { therapistId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          include: {
            user: true
          }
        }
      }
    })
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Resumen profesional"
        description={
          user.role === "ADMIN"
            ? `Espacio de ${therapist.user.fullName}. Vista rápida de agenda, pacientes y últimas sesiones cargadas.`
            : "Visión rápida de tu actividad clínica, pacientes vinculados y últimas sesiones cargadas."
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Próximas citas" value={upcomingAppointments.length} />
        <StatCard label="Pacientes activos" value={patientCount} />
        <StatCard label="Audios recientes" value={recentAudios.length} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink-900">Próximas citas</h2>
            <Link
              className="text-sm font-semibold text-ink-700 underline"
              href={scopedHref("/app/therapist/appointments")}
            >
              Ver agenda
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {upcomingAppointments.length === 0 ? (
              <EmptyState
                title="Sin citas programadas"
                description="Publica disponibilidad o crea una cita manualmente para empezar."
                ctaHref={scopedHref("/app/therapist/appointments")}
                ctaLabel="Crear cita"
              />
            ) : (
              upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-3xl border border-ink-100 bg-white/70 p-4"
                >
                  <p className="text-sm font-semibold text-ink-900">
                    {appointment.patient.user.fullName}
                  </p>
                  <p className="mt-1 text-sm text-ink-600">
                    {formatDateTime(appointment.startsAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink-900">Últimos audios subidos</h2>
            <Link
              className="text-sm font-semibold text-ink-700 underline"
              href={scopedHref("/app/therapist/patients")}
            >
              Ver pacientes
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {recentAudios.length === 0 ? (
              <EmptyState
                title="Sin audios todavía"
                description="Sube el primer audio desde la ficha de un paciente."
                ctaHref={scopedHref("/app/therapist/patients")}
                ctaLabel="Abrir pacientes"
              />
            ) : (
              recentAudios.map((audio) => (
                <div key={audio.id} className="rounded-3xl border border-ink-100 bg-white/70 p-4">
                  <p className="text-sm font-semibold text-ink-900">{audio.title}</p>
                  <p className="mt-1 text-sm text-ink-600">
                    {audio.patient.user.fullName} · {formatDateTime(audio.sessionDate)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
