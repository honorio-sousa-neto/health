import { z } from "zod";

export const createExamResult = z.object({
  results: z.array(
    z.object({
      id: z.string().optional(),
      examId: z.string(),
      analystId: z.string(),
      attendingId: z.string(),
      result: z.record(z.any()),
    })
  ),
});

export type TCreateExamResult = z.infer<typeof createExamResult>;

export const updateExamResult = z.object({
  results: z.array(
    z.object({
      examId: z.string(),
      analystId: z.string(),
      attendingId: z.string(),
      result: z.record(z.any()),
    })
  ),
});

export type TUpdateExamResult = z.infer<typeof updateExamResult>;
