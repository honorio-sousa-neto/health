import { ObservationStage } from "@prisma/client";
import { z } from "zod";

export const createConsultation = z.object({
  name: z.string(),
  description: z.string().optional(),
  serviceId: z.string(),
});

export type TCreateConsultation = z.infer<typeof createConsultation>;

export const updateConsultation = z.object({
  stage: z.enum(["EXAM_RESULT", "CONSULTING_CLINIC"]).optional(),
  doctorId: z.string().optional(),
  // exams: z.array(z.string()).optional(),
  description: z.string().optional().nullable(),
  diagnosis: z.string().optional(),
  status: z
    .enum([
      ObservationStage.done,
      ObservationStage.pending,
      ObservationStage.running,
    ])
    .optional(),
});

export type TUpdateConsultation = z.infer<typeof updateConsultation>;
