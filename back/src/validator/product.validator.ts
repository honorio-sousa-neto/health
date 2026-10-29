import {
  EntryOrOut,
  StatusService,
  TypeItem,
} from "@prisma/client";
import { z } from "zod";

export const createProduct = z.object({
  name: z.string(),
  unit_price: z.number(),
  isInput: z.boolean().optional(),
  typeInput: z.string().optional().nullable(),
  exemptionId: z.string().nullable().optional().transform(val => val ?? undefined),
  tax: z.number().nullable().optional(),
  hasIva: z.boolean().optional(),
  categoryId: z.string().optional().nullable().transform(val => val ?? undefined),
  account_code: z.string().nullable().optional(),
  status: z
    .enum([StatusService.AVAILABLE, StatusService.UNAVAILABE])
    .optional(),
  description: z.string().optional().nullable(),
  discount: z.number().optional().nullable(),
  exemptionCode: z.string().optional(),
  quantity: z.number().optional().nullable(),
  unitId: z.string().uuid().optional().nullable().transform(val => val ?? undefined),
  unitsPerPackage: z.number().positive().optional().nullable(),
});

export type TCreateProduct = z.infer<typeof createProduct> & {
  type: TypeItem;
};

export const updateProduct = z.object({
  name: z.string().optional(),
  unit_price: z.number().optional(),
  type: z.nativeEnum(TypeItem).optional(),
  isInput: z.boolean().optional(),
  typeInput: z.string().optional().nullable(),
  tax: z.number().nullable().optional(),
  hasIva: z.boolean().optional(),
  categoryId: z.string().optional().nullable().transform(val => val ?? undefined),
  exemptionId: z.string().nullable().optional().transform(val => val ?? undefined),
  account_code: z.string().nullable().optional(),
  status: z
    .enum([StatusService.AVAILABLE, StatusService.UNAVAILABE])
    .optional(),
  description: z.string().optional().nullable(),
  discount: z.number().optional().nullable(),
  exemptionCode: z.string().optional().nullable(),
  deletedAt: z.date().optional().nullable(),
  quantity: z.number().optional().nullable(),
  unitId: z.string().uuid().optional().nullable().transform(val => val ?? undefined),
  unitsPerPackage: z.number().positive().optional().nullable(),
});

export type TUpdateProduct = z.infer<typeof updateProduct>;

export const attachProductMaterial = z.object({
  productId: z.string(),
  materials: z.array(
    z.object({ consumableId: z.string(), quantity: z.number() })
  ),
});

export type TAttachProductMaterial = z.infer<typeof attachProductMaterial>;

export const addProductStock = z.object({
  productId: z.string(),
  quantity: z.number(),
  transactionType: z.enum([EntryOrOut.ENTRY, EntryOrOut.OUT]),
});

export type TAddProductStock = z.infer<typeof addProductStock>;
