import { z } from "zod";

export const createSymptoms = z.object({
  title: z.string(),
});

export type TCreateSymptoms = z.infer<typeof createSymptoms>;

export const updateSymptoms = z.object({
  title: z.string(),
});

export type TUpdateSymptoms = z.infer<typeof updateSymptoms>;
