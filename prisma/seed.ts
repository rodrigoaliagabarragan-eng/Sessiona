import fs from "node:fs/promises";
import path from "node:path";
import { addDays, addMinutes, subDays } from "date-fns";
import {
  AppointmentStatus,
  PrismaClient,
  UserRole
} from "@prisma/client";
import { DEMO_PASSWORD } from "../src/lib/constants";
import { hashPassword } from "../src/lib/password";
import { audioStorage } from "../src/lib/storage/audio-storage";

const prisma = new PrismaClient();

function createDemoWavBuffer(durationSeconds: number, frequency = 220) {
  const sampleRate = 8000;
  const samples = sampleRate * durationSeconds;
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < samples; index += 1) {
    const sample =
      Math.sin((2 * Math.PI * frequency * index) / sampleRate) * 0.25;
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + index * 2);
  }

  return buffer;
}

function createSlot(dayOffset: number, hour: number, minute: number, duration = 50) {
  const startsAt = addDays(new Date(), dayOffset);
  startsAt.setHours(hour, minute, 0, 0);

  return {
    startsAt,
    endsAt: addMinutes(startsAt, duration)
  };
}

async function resetStorage() {
  const root = path.resolve(
    process.cwd(),
    process.env.AUDIO_STORAGE_ROOT ?? "storage/audio"
  );

  await fs.rm(root, { recursive: true, force: true });
  await fs.mkdir(root, { recursive: true });
}

async function createAudioSession(params: {
  therapistId: string;
  patientId: string;
  uploadedByUserId: string;
  title: string;
  originalFileName: string;
  durationSeconds: number;
  sessionDate: Date;
  notesPrivate?: string;
  appointmentId?: string;
  frequency?: number;
}) {
  const stored = await audioStorage.save({
    buffer: createDemoWavBuffer(params.durationSeconds, params.frequency),
    mimeType: "audio/wav",
    originalFileName: params.originalFileName,
    therapistId: params.therapistId,
    patientId: params.patientId
  });

  return prisma.audioSession.create({
    data: {
      therapistId: params.therapistId,
      patientId: params.patientId,
      uploadedByUserId: params.uploadedByUserId,
      appointmentId: params.appointmentId,
      title: params.title,
      sessionDate: params.sessionDate,
      durationSeconds: params.durationSeconds,
      notesPrivate: params.notesPrivate,
      originalFileName: stored.originalFileName,
      mimeType: stored.mimeType,
      byteSize: stored.byteSize,
      storageKey: stored.storageKey,
      checksum: stored.checksum
    }
  });
}

async function main() {
  await resetStorage();

  await prisma.audioAccessLog.deleteMany();
  await prisma.audioSession.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.availabilityRule.deleteMany();
  await prisma.therapistPatient.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.therapistProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const admin = await prisma.user.create({
    data: {
      email: "admin@demo.com",
      fullName: "Admin Demo",
      role: UserRole.ADMIN,
      passwordHash
    }
  });

  const therapist = await prisma.user.create({
    data: {
      email: "therapist@demo.com",
      fullName: "Dra. Elena Martín",
      role: UserRole.THERAPIST,
      passwordHash,
      therapistProfile: {
        create: {
          title: "Psicóloga General Sanitaria",
          licenseNumber: "M-87421",
          bio: "Especializada en ansiedad, trauma y procesos de regulación emocional.",
          defaultSessionDurationMinutes: 50
        }
      }
    },
    include: {
      therapistProfile: true
    }
  });

  const patient = await prisma.user.create({
    data: {
      email: "patient@demo.com",
      fullName: "Laura Gómez",
      role: UserRole.PATIENT,
      passwordHash,
      patientProfile: {
        create: {
          notes: "Paciente principal de demo."
        }
      }
    },
    include: {
      patientProfile: true
    }
  });

  const patientTwo = await prisma.user.create({
    data: {
      email: "patient2@demo.com",
      fullName: "Diego Ruiz",
      role: UserRole.PATIENT,
      passwordHash,
      patientProfile: {
        create: {
          notes: "Caso de seguimiento semanal."
        }
      }
    },
    include: {
      patientProfile: true
    }
  });

  const patientThree = await prisma.user.create({
    data: {
      email: "patient3@demo.com",
      fullName: "María Torres",
      role: UserRole.PATIENT,
      passwordHash,
      patientProfile: {
        create: {
          notes: "Paciente con audio y huecos próximos."
        }
      }
    },
    include: {
      patientProfile: true
    }
  });

  const therapistId = therapist.therapistProfile!.id;
  const primaryPatientId = patient.patientProfile!.id;
  const secondPatientId = patientTwo.patientProfile!.id;
  const thirdPatientId = patientThree.patientProfile!.id;

  await prisma.therapistPatient.createMany({
    data: [
      { therapistId, patientId: primaryPatientId },
      { therapistId, patientId: secondPatientId },
      { therapistId, patientId: thirdPatientId }
    ]
  });

  await prisma.availabilityRule.createMany({
    data: [
      {
        therapistId,
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "13:00",
        slotDurationMinutes: 50
      },
      {
        therapistId,
        dayOfWeek: 3,
        startTime: "15:00",
        endTime: "19:00",
        slotDurationMinutes: 50
      },
      {
        therapistId,
        dayOfWeek: 4,
        startTime: "10:00",
        endTime: "14:00",
        slotDurationMinutes: 50
      }
    ]
  });

  const completedAppointment = await prisma.appointment.create({
    data: {
      therapistId,
      patientId: primaryPatientId,
      createdByUserId: therapist.id,
      status: AppointmentStatus.COMPLETED,
      ...createSlot(-7, 18, 0)
    }
  });

  await prisma.appointment.create({
    data: {
      therapistId,
      patientId: secondPatientId,
      createdByUserId: therapist.id,
      status: AppointmentStatus.NO_SHOW,
      ...createSlot(-3, 11, 0)
    }
  });

  await prisma.appointment.create({
    data: {
      therapistId,
      patientId: primaryPatientId,
      createdByUserId: patient.id,
      status: AppointmentStatus.SCHEDULED,
      ...createSlot(2, 17, 0),
      patientMessage: "Sesión de seguimiento enfocada en regulación emocional."
    }
  });

  await prisma.appointment.create({
    data: {
      therapistId,
      patientId: secondPatientId,
      createdByUserId: therapist.id,
      status: AppointmentStatus.SCHEDULED,
      ...createSlot(4, 10, 0)
    }
  });

  await prisma.appointment.create({
    data: {
      therapistId,
      patientId: thirdPatientId,
      createdByUserId: therapist.id,
      status: AppointmentStatus.CANCELLED,
      ...createSlot(6, 12, 0),
      cancellationReason: "Cancelada para demo de estados."
    }
  });

  await createAudioSession({
    therapistId,
    patientId: primaryPatientId,
    uploadedByUserId: therapist.id,
    appointmentId: completedAppointment.id,
    title: "Sesión 01 · Regulación y cierre",
    originalFileName: "sesion-01.wav",
    durationSeconds: 180,
    sessionDate: subDays(new Date(), 7),
    notesPrivate:
      "Se exploran detonantes de ansiedad y un ejercicio breve de respiración.",
    frequency: 220
  });

  await createAudioSession({
    therapistId,
    patientId: primaryPatientId,
    uploadedByUserId: therapist.id,
    title: "Sesión 02 · Anclajes prácticos",
    originalFileName: "sesion-02.wav",
    durationSeconds: 150,
    sessionDate: subDays(new Date(), 2),
    notesPrivate: "Se revisan anclajes para uso entre sesiones.",
    frequency: 330
  });

  await createAudioSession({
    therapistId,
    patientId: thirdPatientId,
    uploadedByUserId: therapist.id,
    title: "Sesión 01 · Aterrizaje inicial",
    originalFileName: "sesion-maria.wav",
    durationSeconds: 120,
    sessionDate: subDays(new Date(), 10),
    notesPrivate: "Primera toma de contacto y objetivos terapéuticos.",
    frequency: 260
  });

  console.log("Seed completado correctamente.");
  console.log(`Admin: ${admin.email} / ${DEMO_PASSWORD}`);
  console.log(`Terapeuta: ${therapist.email} / ${DEMO_PASSWORD}`);
  console.log(`Paciente: ${patient.email} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
