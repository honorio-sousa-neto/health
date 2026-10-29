import { Gender } from "@prisma/client";
import { z } from "zod";
const insuranceEntry = z.object({
  insuranceId: z.string(),
  insuranceNumber: z.string().optional().nullable(),
});

export const createCustomer = z.object({
  name: z.string(),
  nif: z.string().optional(),
  address: z.string().optional().nullable(),
  phone: z.string(),
  source: z.string(),
  email: z.string().optional(),
  protocolId: z.string().optional().nullable(),
  partnerId: z.string().optional().nullable(),
  internId: z.string().optional().nullable(),
  list: z.array(z.object({ id: z.string(), order: z.number() })).optional(),
  insurances: z.array(insuranceEntry).optional(),
  gender: z.enum([Gender.FEMALE, Gender.MALE]).nullable().optional(),
  birthday: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val && new Date(val)),
});

export type TCreateCustomer = z.infer<typeof createCustomer>;

export const updateCustomer = z.object({
  name: z.string().optional(),
  nif: z.string().optional().nullable(),
  address: z.string().nullable().optional(),
  phone: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  protocolId: z.string().nullable().optional(),
  partnerId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  internId: z.string().nullable().optional(),
  list: z.array(z.object({ id: z.string(), order: z.number() })).optional(),
  insurances: z.array(insuranceEntry).optional(),
  deletedAt: z.date().optional().nullable(),
  gender: z.enum([Gender.FEMALE, Gender.MALE]).nullable().optional(),
  birthday: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val && new Date(val)),
});

export type TUpdateCustomer = z.infer<typeof updateCustomer>;
export const aggregateCustomer = z.array(z.string());

export type TAggregateCustomer = z.infer<typeof aggregateCustomer>;
