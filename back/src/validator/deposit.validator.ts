import { z } from 'zod'
export const createDeposit = z.object({
  bankAccountId: z.string(),
  amount: z.number(),
})

export type TCreateDeposit = z.infer<typeof createDeposit>

export const updateDeposit = z.object({
  bankAccountId: z.string().optional(),
  amount: z.number().optional(),
})

export type TUpdateDeposit = z.infer<typeof updateDeposit>
