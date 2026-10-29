import { z } from "zod";

export const createCategory = z.object({
  name: z.string().min(3).max(255),
  categoryId: z.string().uuid().optional().nullable(),
});

export type TCreateCategory = z.infer<typeof createCategory>;

export const updateCategory = z.object({
  name: z.string().min(3).max(255).optional(),
  categoryId: z.string().uuid().optional().nullable(),
});

export type TUpdateCategory = z.infer<typeof updateCategory>;
