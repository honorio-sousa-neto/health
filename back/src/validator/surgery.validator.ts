import { ObservationStage } from "@prisma/client";
import { z } from "zod";

export const createSurgery = z.object({
  serviceId: z.string(),
  customerId: z.string().optional(),
  observation: z.string().optional(),
});

export type TCreateSurgery = z.infer<typeof createSurgery>;

export const updateSurgery = z.object({
  serviceId: z.string().optional(),
  paid: z.boolean().optional(),
  customerId: z.string().optional(),
  observation: z.string().optional(),
  status: z.enum([ObservationStage.pending, ObservationStage.running, ObservationStage.done]).optional(),
});

export type TUpdateSurgery = z.infer<typeof updateSurgery>;
