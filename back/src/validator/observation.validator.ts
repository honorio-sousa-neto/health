import { ObservationStage } from "@prisma/client";
import { z } from "zod";

const observationSerum = z.array(
  z.object({
    productId: z.string().uuid().optional(),
    nome: z.string().min(1),
    dose: z.string().optional().nullable(),
    via: z.string().optional().nullable(),
  }).passthrough()
);

export const createObservation = z.object({
  exams: z.array(z.string()),
  consultationId: z.string(),
  serviceId: z.string(),
  serum: observationSerum.optional(),
});

export type TCreateObservation = z.infer<typeof createObservation>;

export const updateObservation = z.object({
  status: z
    .enum([
      ObservationStage.done,
      ObservationStage.pending,
      ObservationStage.running,
    ])
    .optional(),
  paid: z.boolean().optional(),
  description: z.string().optional(),
  serum: observationSerum.optional(),
});

export type TUpdateObservation = z.infer<typeof updateObservation>;
