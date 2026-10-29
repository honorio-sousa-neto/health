import { $Enums, Flow } from '@prisma/client'
import {
  HttpResponse,
  IController,
  IRepository,
  Message,
  StatusCode,
} from '../../types/global.interfaces'
import {
  createFlow,
  TCreateFlow,
  TUpdateFlow,
  updateFlow,
} from '../../validator/flow.validator'

export class FlowController
  implements IController<Flow, TCreateFlow, TUpdateFlow>
{
  constructor(
    private readonly repository: IRepository<Flow, TCreateFlow, TUpdateFlow>
  ) {}
  async index(payload: {
    search?: string
    page?: number
    perPage?: number
    orderBy?: any
  }): Promise<HttpResponse<Flow[]>> {
    try {
      const response = await this.repository.index(payload)
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
  async show(id: string): Promise<HttpResponse<Flow>> {
    try {
      const response = await this.repository.show(id)
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
  async create(payload: TCreateFlow): Promise<HttpResponse<Flow>> {
    try {
      const payloadValidated = createFlow.parse(payload)
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
  async update(id: string, payload: TUpdateFlow): Promise<HttpResponse<Flow>> {
    try {
      const payloadValidated = updateFlow.parse(payload)
      const response = await this.repository.update(id, payloadValidated)
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
  async softDelete(id: string): Promise<HttpResponse<Flow>> {
    try {
      const response = await this.repository.softDelete(id)
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
  async destroy(id: string): Promise<HttpResponse<Flow>> {
    try {
      const response = await this.repository.destroy(id)
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
  async reportByFlow(
    flow: string,
    payload: {
      search?: string
      page?: number
      perPage?: number
      orderBy?: any
      stage?: any
    }
  ): Promise<
    HttpResponse<{
      table: Flow[]
      entry: number
      out: number
      balance: number
    }>
  > {
    try {
      if (!this.repository.reportByFlow)
        throw new Error('METHOD NOT IMPLEMENTED')
      const response = await this.repository.reportByFlow(flow, payload)
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
}
