# Sesiona

MVP funcional de una plataforma SaaS para psicólogos y pacientes, centrada en agenda, portal privado, biblioteca segura de audios y una base técnica limpia para evolucionar con foco fuerte en privacidad y control de acceso.

## Stack

- Next.js 15 con App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- NextAuth con credenciales y sesiones JWT seguras
- React Hook Form + Zod
- Storage abstracto para audio con implementación local
- Docker Compose para levantar PostgreSQL

## Qué incluye el MVP

- Landing sobria y responsive
- Login, registro de paciente, logout y recuperación de contraseña preparada
- Roles `ADMIN`, `THERAPIST`, `PATIENT`
- Panel del terapeuta con:
  - resumen
  - agenda
  - disponibilidad semanal
  - alta/vinculación de pacientes
  - subida de audios con metadatos y notas privadas
- Portal del paciente con:
  - dashboard
  - biblioteca de sesiones
  - reproductor integrado
  - próximas citas
  - reserva de huecos publicados
  - cancelación o solicitud de cambio dentro de ventana permitida
- Streaming protegido de audio por ruta autenticada
- Seeds demo con usuarios, citas, disponibilidad y audios `.wav`
- Migración inicial Prisma
- Tests básicos de dominio y validación

## Arranque local

### 1. Instalar dependencias

```bash
npm install
```

`postinstall` ejecuta `prisma generate` automáticamente.

### 2. Variables de entorno

Ya existe un `.env` local de desarrollo en este workspace. La plantilla versionada es:

- [`.env.example`](/C:/Users/rodri/Downloads/Sesiona/.env.example)

Valores principales:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `AUDIO_STORAGE_ROOT`
- `AUDIO_MAX_SIZE_MB`

### 3. Levantar PostgreSQL

```bash
npm run db:up
```

Esto usa [`docker-compose.yml`](/C:/Users/rodri/Downloads/Sesiona/docker-compose.yml).

### 4. Aplicar migraciones y seed

```bash
npm run prisma:migrate
npm run db:seed
```

Importante:

- El seed está pensado para desarrollo/demo.
- Borra los datos existentes de la base y limpia `storage/audio`.

### 5. Lanzar la app

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Credenciales demo

- `admin@demo.com` / `Demo1234!`
- `therapist@demo.com` / `Demo1234!`
- `patient@demo.com` / `Demo1234!`
- `patient2@demo.com` / `Demo1234!`
- `patient3@demo.com` / `Demo1234!`

## Tests y validación

```bash
npm test
npm run typecheck
npm run build
```

Verificado en este workspace:

- `TypeScript` sin errores
- `npm test` pasando `5/5`
- `next build` completado correctamente

## Estructura del proyecto

```text
src/
  app/
    (marketing)/
    (auth)/
    app/
    api/
  components/
    app-shell/
    forms/
    ui/
  lib/
    services/
    storage/
    validation/
prisma/
  migrations/
  schema.prisma
  seed.ts
tests/
storage/audio/
```

## Decisiones de arquitectura

### Autenticación

- Se ha usado `next-auth@4` con proveedor de credenciales.
- Decisión intencional: priorizar estabilidad sobre introducir la superficie beta de Auth.js v5 para este MVP.
- Las sesiones usan JWT firmado con `NEXTAUTH_SECRET`.
- El login y la protección de rutas no se apoyan solo en frontend; las APIs vuelven a validar rol y ownership en servidor.

### Autorización y separación de roles

- `PATIENT` solo accede a su perfil, sus citas y sus audios.
- `THERAPIST` solo accede a pacientes vinculados mediante `TherapistPatient`.
- `ADMIN` tiene panel propio y puede abrir contexto de un terapeuta concreto desde `/app/admin`.
- Las comprobaciones críticas están en:
  - [`src/lib/permissions.ts`](/C:/Users/rodri/Downloads/Sesiona/src/lib/permissions.ts)
  - [`src/lib/api-session.ts`](/C:/Users/rodri/Downloads/Sesiona/src/lib/api-session.ts)
  - las route handlers dentro de [`src/app/api`](/C:/Users/rodri/Downloads/Sesiona/src/app/api)

### Agenda

- La disponibilidad se define con reglas semanales simples.
- Los huecos se generan dinámicamente y se filtran contra citas ya reservadas.
- La reserva evita dobles reservas mediante validación de solape en transacción serializable.

### Audio

- El audio no se expone como archivo público.
- El reproductor usa `/api/audio/[audioId]/stream`.
- El route handler valida acceso antes de servir el stream.
- Se registra acceso en `AudioAccessLog`.
- La capa de storage está abstraída en:
  - [`src/lib/storage/audio-storage.ts`](/C:/Users/rodri/Downloads/Sesiona/src/lib/storage/audio-storage.ts)
- Hoy usa filesystem local; mañana puede cambiarse por S3-compatible sin tocar el resto del dominio.

### Seeds y demos

- El seed genera audios `.wav` mínimos para que el player funcione inmediatamente.
- También carga citas en distintos estados y disponibilidad realista.

## Archivos principales

- [`prisma/schema.prisma`](/C:/Users/rodri/Downloads/Sesiona/prisma/schema.prisma)
- [`prisma/seed.ts`](/C:/Users/rodri/Downloads/Sesiona/prisma/seed.ts)
- [`src/lib/auth.ts`](/C:/Users/rodri/Downloads/Sesiona/src/lib/auth.ts)
- [`src/lib/permissions.ts`](/C:/Users/rodri/Downloads/Sesiona/src/lib/permissions.ts)
- [`src/lib/services/availability.ts`](/C:/Users/rodri/Downloads/Sesiona/src/lib/services/availability.ts)
- [`src/lib/storage/audio-storage.ts`](/C:/Users/rodri/Downloads/Sesiona/src/lib/storage/audio-storage.ts)
- [`src/app/api/therapist/audio/route.ts`](/C:/Users/rodri/Downloads/Sesiona/src/app/api/therapist/audio/route.ts)
- [`src/app/api/audio/[audioId]/stream/route.ts`](/C:/Users/rodri/Downloads/Sesiona/src/app/api/audio/[audioId]/stream/route.ts)
- [`src/app/app/therapist`](/C:/Users/rodri/Downloads/Sesiona/src/app/app/therapist)
- [`src/app/app/patient`](/C:/Users/rodri/Downloads/Sesiona/src/app/app/patient)

## Mejoras futuras

- Envío real de email para recuperación de contraseña
- Cifrado en reposo para objetos de audio
- Firma temporal de URLs si el storage pasa a S3
- Rate limiting y protección anti brute-force en auth
- Logs de auditoría más completos para cambios sensibles
- Exclusion constraints nativas en PostgreSQL para reforzar solapes de citas a nivel DB
- CRUD operativo más amplio para administración
- Tests de integración/E2E sobre flujos completos

## Riesgos de seguridad pendientes

- No hay cifrado de archivos en reposo todavía; la arquitectura solo queda preparada
- La recuperación de contraseña en demo no envía emails reales
- No hay rate limiting por IP/email en login y recuperación
- No hay 2FA
- La protección de audio depende de autenticación de aplicación; no hay DRM ni revocación granular
- El admin tiene una UI ligera; el backend ya contempla contexto administrativo, pero falta mayor tooling operativo
- La política de cancelación/reagendado está simplificada a una ventana fija de autogestión

## Notas útiles

- La migración inicial se encuentra en [`prisma/migrations/202604190001_init/migration.sql`](/C:/Users/rodri/Downloads/Sesiona/prisma/migrations/202604190001_init/migration.sql)
- Los audios demo se regeneran con el seed
- Si quieres cambiar el storage local, el punto natural de extensión es `AudioStorage`
