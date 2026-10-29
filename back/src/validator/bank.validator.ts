import { z } from 'zod'
export const createBankAccount = z.object({
  name: z.string(),
  iban: z.string(),
  number: z.string(),
  companyId: z.string(),
})

export type TCreateBankAccount = z.infer<typeof createBankAccount>

export const updateBankAccount = z.object({
  name: z.string().optional(),
  iban: z.string().optional(),
  number: z.string().optional(),
  companyId: z.string().optional(),
})

export type TUpdateBankAccount = z.infer<typeof updateBankAccount>
