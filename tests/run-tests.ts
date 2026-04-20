import assert from "node:assert/strict";
import { addHours } from "date-fns";
import { createPatientSchema } from "../src/lib/validation/patients";
import { registerSchema } from "../src/lib/validation/auth";
import { canPatientModifyAppointment } from "../src/lib/services/appointments";
import { generateAvailableSlots } from "../src/lib/services/availability";
import { therapistAppointmentSchema } from "../src/lib/validation/appointments";

type Case = {
  name: string;
  run: () => void;
};

const cases: Case[] = [
  {
    name: "generateAvailableSlots excluye huecos ocupados",
    run() {
      const from = new Date(2026, 3, 20, 8, 0, 0);
      const slots = generateAvailableSlots({
        from,
        days: 1,
        rules: [
          {
            dayOfWeek: from.getDay(),
            startTime: "09:00",
            endTime: "11:00",
            slotDurationMinutes: 50,
            isActive: true
          }
        ],
        appointments: [
          {
            startsAt: new Date(2026, 3, 20, 9, 50, 0),
            endsAt: new Date(2026, 3, 20, 10, 40, 0),
            status: "SCHEDULED"
          }
        ]
      });

      assert.equal(slots.length, 1);
      assert.equal(slots[0]?.startsAt.getHours(), 9);
      assert.equal(slots[0]?.startsAt.getMinutes(), 0);
    }
  },
  {
    name: "canPatientModifyAppointment respeta la ventana de autogestión",
    run() {
      assert.equal(canPatientModifyAppointment(addHours(new Date(), 30)), true);
      assert.equal(canPatientModifyAppointment(addHours(new Date(), 4)), false);
    }
  },
  {
    name: "therapistAppointmentSchema calcula la hora de fin",
    run() {
      const parsed = therapistAppointmentSchema.parse({
        patientId: "patient_1",
        startsAt: "2026-04-23T10:00",
        durationMinutes: 50,
        patientMessage: "Seguimiento"
      });

      assert.ok(parsed.startsAt instanceof Date);
      assert.equal(parsed.endsAt.getTime() - parsed.startsAt.getTime(), 50 * 60000);
    }
  },
  {
    name: "registerSchema rechaza contraseñas débiles",
    run() {
      const result = registerSchema.safeParse({
        fullName: "Laura",
        email: "laura@example.com",
        password: "12345678",
        confirmPassword: "12345678"
      });

      assert.equal(result.success, false);
    }
  },
  {
    name: "createPatientSchema convierte fecha vacía en undefined",
    run() {
      const result = createPatientSchema.parse({
        fullName: "Paciente Demo",
        email: "paciente@example.com",
        phone: "",
        dateOfBirth: "",
        notes: ""
      });

      assert.equal(result.dateOfBirth, undefined);
    }
  }
];

let passed = 0;

for (const testCase of cases) {
  try {
    testCase.run();
    passed += 1;
    console.log(`PASS ${testCase.name}`);
  } catch (error) {
    console.error(`FAIL ${testCase.name}`);
    console.error(error);
    process.exit(1);
  }
}

console.log(`Completed ${passed}/${cases.length} tests.`);
