import { TypeIntern } from "@prisma/client";
import { z } from "zod";
export const createIntern = z.object({
  name: z.string(),
  amount: z.number(),
  type: z.enum([TypeIntern.familiar, TypeIntern.pregnancy, TypeIntern.single]),
  services: z.array(z.string()),
  internTax: z.number().nullable(),
  examBoundary: z.number(),
});

export type TCreateIntern = z.infer<typeof createIntern>;

export const updateIntern = z.object({
  name: z.string(),
  amount: z.number(),
  type: z.enum([TypeIntern.familiar, TypeIntern.pregnancy, TypeIntern.single]),
  internTax: z.number(),
  examBoundary: z.number(),
  services: z.array(z.string()),
  aggregations: z.record(z.any()),
});

export type TUpdateIntern = z.infer<typeof updateIntern>;
