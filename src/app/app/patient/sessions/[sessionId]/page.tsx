import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { formatDateTime, formatDurationFromSeconds } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function PatientSessionDetailPage({
  params
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requireRole(["PATIENT"]);
  const patientId = user.patientProfileId;
  const { sessionId } = await params;

  if (!patientId) {
    return null;
  }

  const session = await prisma.audioSession.findFirst({
    where: {
      id: sessionId,
      patientId
    },
    include: {
      therapist: {
        include: { user: true }
      }
    }
  });

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Detalle de sesión"
        title={session.title}
        description={`${formatDateTime(session.sessionDate)} · ${formatDurationFromSeconds(session.durationSeconds)}`}
      />
      <Card className="p-6">
        <div className="space-y-4">
          <p className="text-sm text-ink-600">
            Profesional: {session.therapist.user.fullName}
          </p>
          <audio
            className="w-full"
            controls
            preload="metadata"
            src={`/api/audio/${session.id}/stream`}
          />
          <Link className="text-sm font-semibold text-ink-700 underline" href="/app/patient/sessions">
            Volver a la biblioteca
          </Link>
        </div>
      </Card>
    </div>
  );
}
