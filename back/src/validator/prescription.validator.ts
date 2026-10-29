import { PrescriptionType } from "@prisma/client";
import { z } from "zod";

export const createPrescriptionItem = z.object({
  serviceId: z.string(),
  dose: z.string(),
  frequency: z.string(),
  canal: z.string(),
  duration: z.number(),
  quantity: z.string(),
});
export type TCreatePrescriptionItem = z.infer<typeof createPrescriptionItem>;

export const createPrescription = z.object({
  type: z.enum([PrescriptionType.AMBULATORY, PrescriptionType.PHARMACY]),
  userId: z.string(),
  consultationId: z.string(),
  items: z.array(createPrescriptionItem),
});
export type TCreatePrescription = z.infer<typeof createPrescription>;

export const updatePrescription = z.object({
  type: z
    .enum([PrescriptionType.AMBULATORY, PrescriptionType.PHARMACY])
    .optional(),
  userId: z.string().optional(),
  items: z.array(createPrescriptionItem).optional(),
  paid: z.boolean(),
});
export type TUpdatePrescription = z.infer<typeof updatePrescription>;
