import { MovimentationStock } from '@prisma/client'
import { HttpResponse } from './global.interfaces'

export interface ITransactionController {
  addStock(id: string, amount: number): Promise<HttpResponse<MovimentationStock>>
  subtractStock(id: string, amount: number): Promise<HttpResponse<MovimentationStock>>
  reportMonthly(month: number, year: number): Promise<HttpResponse<any>>
}

export interface ITransactionRepository {
  addStock(id: string, amount: number): Promise<MovimentationStock>
  subtractStock(id: string, amount: number): Promise<MovimentationStock>
  reportMonthly(month: number, year: number): Promise<any>
}
