import {
  EntryOrOut,
  StatusService,
  TypeItem,
} from "@prisma/client";
import { z } from "zod";
export const createService = z.object({
  name: z.string(),
  unit_price: z.number(),
  isInput: z.boolean().optional(),
  typeInput: z.string().optional(),
  // sale_price: z.number().optional(),
  exemptionId: z.string().nullable(),
  tax: z.number().nullable().optional(),
  hasIva: z.boolean().optional(),
  categoryId: z.string(),
  type: z.enum([TypeItem.PRODUCT, TypeItem.SERVICE]),
  account_code: z.string().nullable().optional(),
  status: z
    .enum([StatusService.AVAILABLE, StatusService.UNAVAILABE])
    .optional(),
  description: z.string(),
  classificacao: z.string().optional().nullable(),
  discount: z.number().optional(),
  exemptionCode: z.string().optional(),
  quantity: z.number().optional().nullable(),
});

export type TCreateService = z.infer<typeof createService>;

export const updateService = z.object({
  name: z.string().optional(),
  unit_price: z.number().optional(),
  // sale_price: z.number().optional(),
  isInput: z.boolean().optional(),
  typeInput: z.string().optional(),
  tax: z.number().nullable().optional(),
  hasIva: z.boolean().optional(),
  categoryId: z.string().optional(),
  exemptionId: z.string().nullable().optional(),
  type: z.enum([TypeItem.PRODUCT, TypeItem.SERVICE]).optional(),
  account_code: z.string().nullable().optional(),
  status: z
    .enum([StatusService.AVAILABLE, StatusService.UNAVAILABE])
    .optional(),
  description: z.string().optional().nullable(),
  classificacao: z.string().optional().nullable(),
  sale_price: z.number().optional().nullable(),
  discount: z.number().optional().nullable(),
  exemptionCode: z.string().optional().nullable(),
  deletedAt: z.date().optional().nullable(),
  quantity: z.number().optional().nullable(),
});

export type TUpdateService = z.infer<typeof updateService>;

export const attachMaterial = z.object({
  serviceId: z.string(),
  materials: z.array(
    z.object({ consumableId: z.string(), quantity: z.number() })
  ),
});

export type TAttachMaterial = z.infer<typeof attachMaterial>;

export const addStock = z.object({
  productId: z.string(),
  quantity: z.number(),
  transactionType: z.enum([EntryOrOut.ENTRY, EntryOrOut.OUT]),
});

export type TAddStock = z.infer<typeof addStock>;
