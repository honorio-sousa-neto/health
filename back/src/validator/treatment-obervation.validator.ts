import { z } from 'zod'
export const createTreatmentObservation = z.object({
    serviceId: z.string(),
    name: z.string(),
    description: z.string(),
})

export type TCreateTreatmentObservation = z.infer<typeof createTreatmentObservation>

export const updateTreatmentObservation = z.object({
    serviceId: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
})

export type TUpdateTreatmentObservation = z.infer<typeof updateTreatmentObservation>
