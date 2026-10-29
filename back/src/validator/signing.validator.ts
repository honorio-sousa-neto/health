import { z } from "zod";
export const createSigning = z.object({
  customerId: z.string(),
  internId: z.string(),
  startDate: z.string().transform((date) => {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(`${year}-${month}-${day}`);
  }),
  endDate: z.string().transform((date) => {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(`${year}-${month}-${day}`);
  }),
  members: z.array(z.string()).nullable(),
});

export type TCreateSigning = z.infer<typeof createSigning>;

export const updateSigning = z.object({
  customerId: z.string().optional(),
  internId: z.string().optional(),
  startDate: z.string().transform((date) => {
    const [year, month, day] = date.split("T")[0].split("-").map(Number);
    return new Date(`${year}-${month}-${day}`);
  }),
  endDate: z.string().transform((date) => {
    const [year, month, day] = date.split("T")[0].split("-").map(Number);
    return new Date(`${year}-${month}-${day}`);
  }),

  members: z.array(z.string()).optional(),
});

export type TUpdateSigning = z.infer<typeof updateSigning>;
