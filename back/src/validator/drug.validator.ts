import { z } from "zod";

export const createDrug = z.object({
  name: z.string().min(3).max(255),
  tax: z.number().min(0),
  amount: z.number().min(0),
});

export type TCreateDrug = z.infer<typeof createDrug>;

export const updateDrug = z.object({
  name: z.string().min(3).max(255).optional(),
  tax: z.number().min(0).optional(),
  amount: z.number().min(0).optional(),
});

export type TUpdateDrug = z.infer<typeof updateDrug>;
