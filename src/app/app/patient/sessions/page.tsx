import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { formatDateTime, formatDurationFromSeconds } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function PatientSessionsPage() {
  const user = await requireRole(["PATIENT"]);
  const patientId = user.patientProfileId!;
  const sessions = await prisma.audioSession.findMany({
    where: { patientId },
    orderBy: { sessionDate: "desc" },
    include: {
      therapist: {
        include: { user: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Biblioteca"
        title="Sesiones de audio"
        description="Reproduce tus sesiones en streaming seguro desde tu biblioteca privada."
      />
      <Card className="p-6">
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <EmptyState
              title="Tu biblioteca está vacía"
              description="Aquí aparecerán las grabaciones que tu terapeuta suba para ti."
            />
          ) : (
            sessions.map((session) => (
              <Link
                key={session.id}
                href={`/app/patient/sessions/${session.id}`}
                className="block rounded-3xl border border-ink-100 bg-white/70 p-4 transition hover:border-accent"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-ink-900">{session.title}</p>
                    <p className="mt-1 text-sm text-ink-600">
                      {formatDateTime(session.sessionDate)} ·{" "}
                      {formatDurationFromSeconds(session.durationSeconds)}
                    </p>
                  </div>
                  <p className="text-sm text-ink-600">
                    {session.therapist.user.fullName}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
