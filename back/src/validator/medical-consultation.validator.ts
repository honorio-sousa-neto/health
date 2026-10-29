import {} from "@prisma/client";
import { z } from "zod";

export const createMedicalConsultation = z.object({
  customerId: z.string(),
  consultationId: z.string(),
});

export type TCreateMedicalConsultation = z.infer<
  typeof createMedicalConsultation
>;

export const updateMedicalConsultation = z.object({
  consultationId: z.string().optional(),
  historyClinic: z.record(z.any()).optional(),
  byQuestioning: z.string().optional(),
  byExamPhysics: z.string().optional(),
  reasonOfConsultation: z.string().optional(),
  screeningId: z.string().optional(),
  doctorId: z.string().optional(),
  diagnosis: z.string().optional(),
  allergies: z.any().optional(),
  observation: z.string().optional(),
  prescription: z.any().optional(),
  symptoms: z.array(z.string()).optional(),
  requests: z.array(z.string()).optional(),
});

export type TUpdateMedicalConsultation = z.infer<
  typeof updateMedicalConsultation
>;

export const requestExams = z.object({
  doctorId: z.string(),
  exams: z.array(z.object({ examId: z.string() })),
  medicalConsultationId: z.string(),
});

export type TRequestExams = z.infer<typeof requestExams>;
