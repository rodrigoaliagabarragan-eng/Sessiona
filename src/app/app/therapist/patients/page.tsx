import Link from "next/link";
import { TherapistPatientForm } from "@/components/forms/therapist-patient-form";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function TherapistPatientsPage({
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
        description="Abre el listado desde el panel de administración para trabajar sobre un profesional."
        ctaHref="/app/admin"
        ctaLabel="Volver al admin"
      />
    );
  }

  const scopedHref = (path: string) =>
    user.role === "ADMIN"
      ? `${path}${path.includes("?") ? "&" : "?"}therapistId=${therapistId}`
      : path;
  const patients = await prisma.therapistPatient.findMany({
    where: { therapistId },
    orderBy: { assignedAt: "asc" },
    include: {
      patient: {
        include: {
          user: true,
          appointments: {
            where: { startsAt: { gte: new Date() }, status: "SCHEDULED" },
            orderBy: { startsAt: "asc" },
            take: 1
          },
          audioSessions: {
            orderBy: { sessionDate: "desc" },
            take: 1
          }
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pacientes"
        title="Gestión de pacientes"
        description="Crea pacientes manualmente o vincula cuentas existentes mediante email para mantener un único portal por persona."
      />
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Alta o vinculación</h2>
          <div className="mt-5">
            <TherapistPatientForm therapistId={therapistId} />
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Pacientes vinculados</h2>
          <div className="mt-5 space-y-4">
            {patients.length === 0 ? (
              <EmptyState
                title="Sin pacientes aún"
                description="Cuando vincules el primero, aparecerán aquí sus citas y sus audios."
              />
            ) : (
              patients.map((item) => (
                <Link
                  key={item.id}
                  href={scopedHref(`/app/therapist/patients/${item.patient.id}`)}
                  className="block rounded-3xl border border-ink-100 bg-white/70 p-4 transition hover:border-accent"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-ink-900">{item.patient.user.fullName}</p>
                      <p className="text-sm text-ink-600">{item.patient.user.email}</p>
                    </div>
                    <div className="space-y-1 text-sm text-ink-600">
                      <p>
                        Próxima cita:{" "}
                        {item.patient.appointments[0]
                          ? formatDateTime(item.patient.appointments[0].startsAt)
                          : "Sin agendar"}
                      </p>
                      <p>
                        Último audio:{" "}
                        {item.patient.audioSessions[0]
                          ? formatDateTime(item.patient.audioSessions[0].sessionDate)
                          : "No hay"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
