import { Symptoms } from '@prisma/client'
import {
  HttpResponse,
  IController,
  IRepository,
  Message,
  StatusCode,
} from '../../types/global.interfaces'
import {
  createSymptoms,
  TCreateSymptoms,
  TUpdateSymptoms,
} from '../../validator/symptom.validator'

export class SymptomsController
  implements IController<Symptoms, TCreateSymptoms, TUpdateSymptoms>
{
  constructor(
    private readonly repository: IRepository<
      Symptoms,
      TCreateSymptoms,
      TUpdateSymptoms
    >
  ) {}
  async index(payload: {
    search?: string
    page: number
    perPage: number
    orderBy?: any
    category?: string
  }): Promise<HttpResponse<Symptoms[]>> {
    try {
      const response = await this.repository.index(payload)
      return {
        message: Message.OK,
        body: response,
        status: StatusCode.OK,
        success: true,
      }
    } catch (error) {
      return {
        message: Message.OK,
        status: StatusCode.OK,
        success: true,
      }
    }
  }
  indexByStatus?(payload: {
    search?: string
    page: number
    perPage: number
    orderBy?: any
    status?: string
  }): Promise<HttpResponse<Symptoms[]>> {
    throw new Error('Method not implemented.')
  }
  show(id: string): Promise<HttpResponse<Symptoms>> {
    throw new Error('Method not implemented.')
  }
  async create(payload: { title: string }): Promise<HttpResponse<Symptoms>> {
    try {
      const payloadValidated = createSymptoms.parse(payload)
      const response = await this.repository.create(payloadValidated)
      return {
        message: Message.OK,
        body: response,
        status: StatusCode.OK,
        success: true,
      }
    } catch (error: any) {
      return {
        message: error.message,
        status: StatusCode.OK,
        success: true,
      }
    }
  }
  update(
    id: string,
    payload: { title: string }
  ): Promise<HttpResponse<Symptoms>> {
    throw new Error('Method not implemented.')
  }
  softDelete(id: string): Promise<HttpResponse<Symptoms>> {
    throw new Error('Method not implemented.')
  }
  destroy(id: string): Promise<HttpResponse<Symptoms>> {
    throw new Error('Method not implemented.')
  }
  searchByName?(name: string): Promise<HttpResponse<Symptoms[]>> {
    throw new Error('Method not implemented.')
  }
  filter?(search: string): Promise<HttpResponse<Symptoms[]>> {
    throw new Error('Method not implemented.')
  }
  invoiceFromInsurance?(
    payload: {
      search?: string
      page: number
      perPage: number
      orderBy?: any
      category?: string
    },
    insuranceId: string,
    statusOfDocument: string
  ): Promise<HttpResponse<Symptoms[]>> {
    throw new Error('Method not implemented.')
  }
  invoiceFromCustomer?(
    payload: {
      search?: string
      page: number
      perPage: number
      orderBy?: any
      category?: string
    },
    insuranceId: string,
    statusOfDocument: string
  ): Promise<HttpResponse<Symptoms[]>> {
    throw new Error('Method not implemented.')
  }
  invoiceFromInsuranceTotal?(
    insuranceId: string,
    statusOfDocument: string
  ): Promise<HttpResponse<number | null>> {
    throw new Error('Method not implemented.')
  }
}
