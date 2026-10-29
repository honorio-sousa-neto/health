import { HttpResponse } from './global.interfaces'

export type Range = {
  from: string
  to: string
}

export interface FinancialReport {
  label: string
  value: number
}

export interface IControllerDashboard {
  financialReport(range: Range): Promise<HttpResponse<FinancialReport[]>>
}
