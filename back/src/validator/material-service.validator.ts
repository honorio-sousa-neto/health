import { z } from "zod";

export const createMaterialOfService = z.object({
  serviceId: z.string(),
  consumableId: z.string(),
  quantity: z.number(),
});

export type TCreateMaterialOfService = z.infer<typeof createMaterialOfService>;
