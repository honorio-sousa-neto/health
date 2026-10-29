import { EntryOrOut } from "@prisma/client";
import { z } from "zod";

export const createInventoryHistory = z.object({
  quantity: z.number(),
  type: z.enum([EntryOrOut.ENTRY, EntryOrOut.OUT]),
  productId: z.string(),
});

export type TCreateInventoryHistory = z.infer<typeof createInventoryHistory>;
