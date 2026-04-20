import { DeleteAvailabilityButton } from "@/components/forms/delete-availability-button";
import { TherapistAvailabilityForm } from "@/components/forms/therapist-availability-form";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { WEEKDAY_OPTIONS } from "@/lib/constants";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const weekdayMap = new Map(WEEKDAY_OPTIONS.map((day) => [day.value, day.label]));

export default async function TherapistAvailabilityPage({
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
        description="Abre la disponibilidad desde el panel de administración para gestionar huecos de un profesional."
        ctaHref="/app/admin"
        ctaLabel="Volver al admin"
      />
    );
  }

  const rules = await prisma.availabilityRule.findMany({
    where: { therapistId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Disponibilidad"
        title="Huecos recurrentes"
        description="Define bloques semanales para generar reservas sin abrir todo el calendario manualmente."
      />
      <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Nueva regla</h2>
          <div className="mt-5">
            <TherapistAvailabilityForm therapistId={therapistId} />
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink-900">Reglas activas</h2>
          <div className="mt-5 space-y-4">
            {rules.length === 0 ? (
              <EmptyState
                title="Sin disponibilidad publicada"
                description="Añade la primera regla para permitir reservas desde el portal del paciente."
              />
            ) : (
              rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex flex-col gap-3 rounded-3xl border border-ink-100 bg-white/70 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-ink-900">
                      {weekdayMap.get(rule.dayOfWeek)} · {rule.startTime} - {rule.endTime}
                    </p>
                    <p className="text-sm text-ink-600">
                      Sesiones de {rule.slotDurationMinutes} minutos
                    </p>
                  </div>
                  <DeleteAvailabilityButton ruleId={rule.id} />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
