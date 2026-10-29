import { Criticality, StatusScreening } from "@prisma/client";
import { z } from "zod";

export const createScreening = z.object({
  customerId: z.string(),
});
export type TCreateScreening = z.infer<typeof createScreening>;

export const updateScreening = z.object({
  height: z.string().nullable().optional(),
  weight: z.string().nullable().optional(),
  isDrinker: z.boolean().default(false).optional(),
  isSmoker: z.boolean().default(false).optional(),
  isChronicPatient: z.boolean().default(false).optional(),
  chronicIll: z.string().nullable().optional(),
  bloodPressure: z.string().optional().nullable(),
  bloodPressureDescription: z.string().optional().nullable(),
  oxygen: z
    .enum([Criticality.GREEN, Criticality.ORANGE, Criticality.RED])
    .optional()
    .nullable(),
  heartbeatRate: z.string().optional().nullable(),
  fever: z
    .enum([Criticality.GREEN, Criticality.ORANGE, Criticality.RED])
    .optional()
    .nullable(),
  breathingRate: z.enum([Criticality.GREEN, Criticality.ORANGE, Criticality.RED]).nullable().optional(),
  nurseId: z.string(),
  status: z.enum([
    StatusScreening.CANCELED,
    StatusScreening.FINISHED,
    StatusScreening.PENDING,
    StatusScreening.RUNNING,
  ]),
});
export type TUpdateScreening = z.infer<typeof updateScreening>;

const sum = 1 + 1;
