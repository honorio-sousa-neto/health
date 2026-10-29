import { z } from 'zod'

export const createAskExam = z.object({
  doctorId: z.string(),
  examId: z.string(),
  attendingId: z.string(),
})

export type TCreateAskExam = z.infer<typeof createAskExam>

export const updateAskExam = z.object({
  doctorId: z.string(),
  examId: z.string(),
  attendingId: z.string(),
})

export type TUpdateAskExam = z.infer<typeof updateAskExam>
