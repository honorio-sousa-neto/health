import { AmbulatoryStatus, ObservationStage } from "@prisma/client";
import { z } from "zod";

export const createAmbulatory = z.object({
  consultationId: z.string(),
});

export type TCreateAmbulatory = z.infer<typeof createAmbulatory>;

export const updateAmbulatory = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
  days: z.record(z.any()).optional(),
  status: z.enum([AmbulatoryStatus.CLOSED, AmbulatoryStatus.OPEN]).optional(),
});

export type TUpdateAmbulatory = z.infer<typeof updateAmbulatory>;
