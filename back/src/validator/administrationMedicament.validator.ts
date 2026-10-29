import { ObservationStage } from "@prisma/client";
import { z } from "zod";

export const createAdministrationMedication = z.object({
  serviceId: z.string(),
  userId: z.string().optional(),
  customerId: z.string().optional(),
  quantity: z.string().optional(),
  type: z.enum(["IM", "IV"]).optional(),
  isThirdParty: z.boolean().optional(),
  drugs: z.array(z.object({
    id: z.string(),
    name: z.string(),
    amount: z.number(),
    quantity: z.number().min(1).default(1),
  })).optional(),
});

export type TCreateAdministrationMedication = z.infer<
  typeof createAdministrationMedication
>;

export const updateAdministrationMedication = z.object({
  status: z
    .enum([ObservationStage.done, ObservationStage.pending, ObservationStage.running])
    .optional(),
  customerId: z.string().optional(),
  paid: z.boolean().optional(),
  type: z.enum(["IM", "IV"]).optional(),
  isThirdParty: z.boolean().optional(),
});

export type TUpdateAdministrationMedication = z.infer<
  typeof updateAdministrationMedication
>;
