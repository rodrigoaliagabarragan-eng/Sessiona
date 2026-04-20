import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  await requireRole(["ADMIN"]);

  const [
    userCount,
    therapistCount,
    patientCount,
    appointmentCount,
    audioCount,
    recentUsers,
    therapists
  ] =
    await Promise.all([
      prisma.user.count(),
      prisma.therapistProfile.count(),
      prisma.patientProfile.count(),
      prisma.appointment.count(),
      prisma.audioSession.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.therapistProfile.findMany({
        include: {
          user: true
        },
        orderBy: {
          user: {
            fullName: "asc"
          }
        }
      })
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administración"
        title="Visión global del sistema"
        description="Panel compacto para supervisar el estado de la plataforma y revisar usuarios de demo."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Usuarios" value={userCount} />
        <StatCard label="Profesionales" value={therapistCount} />
        <StatCard label="Pacientes" value={patientCount} />
        <StatCard label="Citas" value={appointmentCount} />
        <StatCard label="Audios" value={audioCount} />
      </div>
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-ink-900">Acceso por terapeuta</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {therapists.map((therapist) => (
            <a
              key={therapist.id}
              className="rounded-3xl border border-ink-100 bg-white/70 p-4 transition hover:border-accent"
              href={`/app/therapist?therapistId=${therapist.id}`}
            >
              <p className="font-semibold text-ink-900">{therapist.user.fullName}</p>
              <p className="mt-1 text-sm text-ink-600">{therapist.user.email}</p>
            </a>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-ink-900">Usuarios recientes</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-ink-500">
              <tr>
                <th className="pb-3 pr-4">Nombre</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Rol</th>
                <th className="pb-3">Alta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 text-ink-700">
              {recentUsers.map((user) => (
                <tr key={user.id}>
                  <td className="py-3 pr-4 font-medium text-ink-900">{user.fullName}</td>
                  <td className="py-3 pr-4">{user.email}</td>
                  <td className="py-3 pr-4">{user.role}</td>
                  <td className="py-3">{formatDateTime(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
