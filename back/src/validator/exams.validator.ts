import { Input } from '@prisma/client'
import { z } from 'zod'

export const createExam = z.object({
  name: z.string(),
  options: z.any().optional().nullable(),
  subItens: z.any().optional().nullable(),
  isHeader: z.boolean().default(false),
  reference: z.string().optional().nullable(),
  input: z.enum([Input.SELECT, Input.TEXT]).default(Input.TEXT),
  serviceId: z.string(),
  sectionId: z.string().optional().nullable(),
})

export type TCreateExam = z.infer<typeof createExam>

export const updateExam = z.object({
  name: z.string().optional(),
  options: z.any().optional().nullable(),
  subItens: z.any().optional().nullable(),
  isHeader: z.boolean().optional(),
  reference: z.string().optional().nullable(),
  input: z.enum([Input.SELECT, Input.TEXT]).optional(),
  serviceId: z.string().optional(),
  sectionId: z.string().optional().nullable(),
})

export type TUpdateExam = z.infer<typeof updateExam>
