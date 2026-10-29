import { z } from 'zod'

export const createSection = z.object({
  name: z.string(),
})

export type TCreateSection = z.infer<typeof createSection>

export const updateSection = z.object({
  name: z.string(),
})

export type TUpdateSection = z.infer<typeof updateSection>
