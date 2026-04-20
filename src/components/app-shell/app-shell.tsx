"use client";

import { UserRole } from "@prisma/client";
import { CalendarRange, LayoutDashboard, ShieldCheck, Users, Waves } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/app-shell/logout-button";
import { cn } from "@/lib/utils";

type NavigationItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAVIGATION: Record<UserRole, NavigationItem[]> = {
  ADMIN: [
    { href: "/app/admin", label: "Resumen", icon: ShieldCheck }
  ],
  THERAPIST: [
    { href: "/app/therapist", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/therapist/appointments", label: "Agenda", icon: CalendarRange },
    { href: "/app/therapist/patients", label: "Pacientes", icon: Users },
    { href: "/app/therapist/availability", label: "Disponibilidad", icon: Waves }
  ],
  PATIENT: [
    { href: "/app/patient", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/patient/appointments", label: "Citas", icon: CalendarRange },
    { href: "/app/patient/sessions", label: "Sesiones", icon: Waves }
  ]
};

export function AppShell({
  user,
  children
}: {
  user: { name?: string | null; email?: string | null; role: UserRole };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const navigation = NAVIGATION[user.role];

  return (
    <div className="min-h-screen">
      <div className="page-wrap py-6 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="card-surface flex h-fit flex-col gap-8 p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Link className="font-serif text-2xl text-ink-900" href="/">
                  Sesiona
                </Link>
              </div>
              <div className="rounded-3xl bg-ink-900 px-4 py-4 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                  {user.role === "THERAPIST"
                    ? "Psicólogo"
                    : user.role === "PATIENT"
                      ? "Paciente"
                      : "Admin"}
                </p>
                <p className="mt-2 text-base font-semibold">{user.name}</p>
                <p className="text-sm text-white/70">{user.email}</p>
              </div>
            </div>
            <nav className="space-y-2">
              {navigation.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-accent/35 text-ink-900"
                        : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-2">
              <LogoutButton />
            </div>
          </aside>
          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
