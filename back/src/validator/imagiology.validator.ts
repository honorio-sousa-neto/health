import { z } from 'zod'
export const createImagiology = z.object({
    serviceId: z.string(),
    name: z.string(),
    description: z.string(),
})

export type TCreateImagiology = z.infer<typeof createImagiology>

export const updateImagiology = z.object({
    serviceId: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
})

export type TUpdateImagiology = z.infer<typeof updateImagiology>
