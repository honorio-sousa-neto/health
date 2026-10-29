import {
  EntryOrOut,
  MaterialCategory,
} from "@prisma/client";
import { z } from "zod";

export const createMaterial = z.object({
  name: z.string(),
  // `nullable().optional()` pela mesma razão do `updateMaterial`: a coluna
  // aceita null e o formulário envia null quando o campo fica vazio.
  description: z.string().nullable().optional(),
  quantity: z.number().optional().nullable(),
  minimumQuantity: z.number().optional().nullable(),
  expirationDate: z
    .string()
    .optional()
    .transform((date) => {
      if (!date) return null;
      if (typeof date == "string") return new Date(date);
      return date;
    }),
  price: z.number().optional().nullable(),
  categoryId: z.string(),
  type: z.enum([
    MaterialCategory.consumable,
    MaterialCategory.epi,
    MaterialCategory.equipment,
    MaterialCategory.glassware,
    MaterialCategory.reagent,
    MaterialCategory.standardSolution,
  ]),
  unitId: z.string().uuid().optional().nullable(),
});

export type TCreateMaterial = z.infer<typeof createMaterial>;

export const updateMaterial = z.object({
  name: z.string().optional(),
  // `nullable` e não só `optional`: a coluna aceita null, e o formulário envia
  // null quando o campo está vazio. Com `optional()` sozinho o parse rejeitava
  // e a rota ficava pendurada — ver o try/catch em routers/material.
  description: z.string().nullable().optional(),
  quantity: z.number().optional().nullable(),
  minimumQuantity: z.number().optional().nullable(),
  expirationDate: z
    .string()
    .optional()
    .transform((date) => {
      if (!date) return null;
      if (typeof date == "string") return new Date(date);
      return date;
    }),
  price: z.number().optional().nullable(),
  categoryId: z.string().optional(),
  type: z
    .enum([
      MaterialCategory.consumable,
      MaterialCategory.epi,
      MaterialCategory.equipment,
      MaterialCategory.glassware,
      MaterialCategory.reagent,
      MaterialCategory.standardSolution,
    ])
    .optional(),
  unitId: z.string().uuid().optional().nullable(),
  deletedAt: z.date().optional().nullable(),
});

export type TUpdateMaterial = z.infer<typeof updateMaterial>;

export const updateMaterialQuantity = z.object({
  quantity: z.number(),
  type: z.enum([EntryOrOut.ENTRY, EntryOrOut.OUT]),
});

export type TUpdateMaterialQuantity = z.infer<typeof updateMaterialQuantity>;
