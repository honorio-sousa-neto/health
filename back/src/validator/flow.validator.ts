import { EntryOrOut } from "@prisma/client";
import { z } from "zod";
export const createFlow = z.object({
  destination: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.enum([EntryOrOut.ENTRY, EntryOrOut.OUT]),
});

export type TCreateFlow = z.infer<typeof createFlow>;

export const updateFlow = z.object({
  destination: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.enum([EntryOrOut.ENTRY, EntryOrOut.OUT]),
});

export type TUpdateFlow = z.infer<typeof updateFlow>;
