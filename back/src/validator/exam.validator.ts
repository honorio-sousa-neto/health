import { z } from "zod";
export const createExamAttending = z.array(
  z.object({
    id: z.string().optional(),
    serviceId: z.string(),
    attendingId: z.string(),
    area: z.string(),
  })
);

export type TCreateExamAttending = z.infer<typeof createExamAttending>;

export const updateExamAttending = z.array(
  z.object({
    result: z.string(),
    notes: z.string().nullable(),
    id: z.string(),
  })
);

export type TUpdateExamAttending = z.infer<typeof updateExamAttending>;
