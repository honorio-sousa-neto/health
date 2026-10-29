import { z } from 'zod'
export const createHospitalization = z.object({
    serviceId: z.string(),
    name: z.string(),
    description: z.string(),
})

export type TCreateHospitalization = z.infer<typeof createHospitalization>

export const updateHospitalization = z.object({
    serviceId: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
})

export type TUpdateHospitalization = z.infer<typeof updateHospitalization>
