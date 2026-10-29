import { z } from "zod";

export const createVisit = z.object({
  customerId: z.string(),
  services: z.record(z.any()),
});

export type TCreateVisit = z.infer<typeof createVisit>;

export const updateVisit = z.object({
  customerId: z.string(),
  services: z.record(z.any()),
});

export type TUpdateVisit = z.infer<typeof updateVisit>;
