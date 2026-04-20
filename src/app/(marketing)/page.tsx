import { ArrowRight, CalendarRange, LockKeyhole, Waves } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const highlights = [
  {
    title: "Agenda clara y privada",
    description:
      "Gestiona pacientes, disponibilidad semanal y reservas sin mezclar datos ni exponer información sensible.",
    icon: CalendarRange
  },
  {
    title: "Biblioteca segura de audios",
    description:
      "Cada paciente accede únicamente a sus grabaciones mediante streaming protegido y control de permisos en servidor.",
    icon: Waves
  },
  {
    title: "Arquitectura pensada para crecer",
    description:
      "Next.js, Prisma, PostgreSQL y storage desacoplado para evolucionar a S3, auditoría y cifrado sin rehacer el núcleo.",
    icon: LockKeyhole
  }
];

export default function LandingPage() {
  return (
    <div className="page-wrap py-6 sm:py-10">
      <section className="overflow-hidden rounded-[2.5rem] border border-white/60 bg-hero-glow px-6 py-8 shadow-soft sm:px-10 sm:py-12">
        <header className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-ink-600">
              Plataforma privada para psicología
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-serif text-5xl leading-tight text-ink-900 sm:text-6xl">
                Agenda, pacientes y sesiones de audio en un entorno sobrio y seguro.
              </h1>
              <p className="max-w-2xl text-lg text-ink-700">
                Sesiona reúne la operativa clínica esencial del MVP: autenticación
                por roles, agenda compartida, portal del paciente y biblioteca
                privada de audios, todo preparado para crecer sin atajos.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className={buttonVariants("primary", "px-6")} href="/login">
                Entrar a la demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link className={buttonVariants("secondary", "px-6")} href="/register">
                Crear cuenta de paciente
              </Link>
            </div>
          </div>
          <Card className="w-full max-w-sm bg-white/75 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ink-500">
              Qué cubre esta primera versión
            </p>
            <ul className="mt-5 space-y-4 text-sm text-ink-700">
              <li>Panel del terapeuta con citas, disponibilidad, pacientes y audios.</li>
              <li>Portal del paciente para reproducir sesiones y reservar huecos.</li>
              <li>Autorización real en servidor con separación estricta de roles.</li>
              <li>Storage local abstracto listo para migrar a S3-compatible.</li>
            </ul>
          </Card>
        </header>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="p-6">
              <div className="inline-flex rounded-2xl bg-ink-900 p-3 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-ink-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink-600">{item.description}</p>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
