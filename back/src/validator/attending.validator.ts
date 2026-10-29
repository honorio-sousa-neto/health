import { z } from "zod";

export const createAttending = z.object({
  customerId: z.string(),
  consultationId: z.string().nullable().optional(),
  requestExams: z.any(),
});

export type TCreateAttending = z.infer<typeof createAttending>;

export const createSymptoms = z.object({
  title: z.string(),
});

export type TCreateSymptoms = z.infer<typeof createSymptoms>;

export const updateAttending = z.object({});

export type TUpdateAttending = z.infer<typeof updateAttending>;

export const addSymptom = z.array(
  z.object({
    symptomId: z.string(),
    attendingId: z.string(),
  })
);

export type TAddSymptoms = z.infer<typeof addSymptom>;
