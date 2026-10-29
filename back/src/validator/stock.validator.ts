import { z } from "zod";

export const createStockProducts = z.object({
  productId: z.string(),
  categoryId: z.string(),
});

export type TCreateStockProducts = z.infer<typeof createStockProducts>;

export const updateStockProducts = z.object({
  productId: z.string().optional(),
  categoryId: z.string().optional(),
});

export type TUpdateStockProducts = z.infer<typeof updateStockProducts>;

export const createStockProductsHistory = z.object({
  quantity: z.number(),
  inventoryId: z.string(),
});
