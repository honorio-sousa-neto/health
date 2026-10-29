import { $Enums, Flow } from '@prisma/client'
import { IRepository, Meta } from '../../types/global.interfaces'
import { TCreateFlow, TUpdateFlow } from '../../validator/flow.validator'

import { prisma } from '../../database/prisma'

export class FlowRepository
  implements IRepository<Flow, TCreateFlow, TUpdateFlow>
{
  async index(payload: {
    search?: string
    page: number
    perPage: number
    orderBy?: any
  }): Promise<Meta<Flow[]>> {
    const { page, perPage, search, orderBy } = payload
    const skip = (page - 1) * perPage

    const flows = await prisma.flow.findMany({
      take: perPage,
      skip: skip,
      where: search
        ? {
            AND: [{ description: { contains: search, mode: 'insensitive' } }],
          }
        : {
            AND: [],
          },
      orderBy: JSON.parse(orderBy),
    })
    const total = await prisma.flow.count({
      where: search
        ? {
            AND: [{ description: { contains: search, mode: 'insensitive' } }],
          }
        : {
            AND: [],
          },
    })
    return {
      data: flows,
      meta: {
        page,
        perPage,
        search,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    }
  }

  async show(id: string): Promise<Meta<Flow>> {
    const flow = await prisma.flow.findUnique({
      where: { id },
    })
    return { data: flow }
  }

  async create(payload: TCreateFlow): Promise<Meta<Flow>> {
    const flow = await prisma.flow.create({
      data: { ...payload },
    })
    return { data: flow }
  }

  async update(id: string, payload: TUpdateFlow): Promise<Meta<Flow>> {
    const flow = await prisma.flow.update({
      where: { id },
      data: { ...payload },
    })
    return { data: flow }
  }

  async softDelete(id: string): Promise<Meta<Flow>> {
    const flow = await prisma.flow.update({
      where: { id },
      data: {},
    })
    return { data: flow }
  }

  async destroy(id: string): Promise<Meta<Flow>> {
    const flow = await prisma.flow.delete({
      where: { id },
    })
    return { data: flow }
  }
  async reportByFlow(
    flow: string,
    payload: {
      search: string
      page: number
      perPage: number
      orderBy?: any
    }
  ): Promise<
    Meta<{
      table: Flow[]
      entry: number
      out: number
      balance: number
    }>
  > {
    const { page, perPage, search, orderBy } = payload
    const response = await prisma.flow.findMany({
      where: {
        AND: [{ destination: flow }],
      },
      orderBy: JSON.parse(orderBy),
    })
    const total = await prisma.flow.count({
      where: {
        AND: [{ destination: flow }],
      },
    })
    const entry = await prisma.flow.aggregate({
      where: {
        destination: flow,
        type: 'ENTRY',
      },
      _sum: {
        amount: true,
      },
    })
    const out = await prisma.flow.aggregate({
      where: {
        destination: flow,
        type: 'OUT',
      },
      _sum: {
        amount: true,
      },
    })

    return {
      data: {
        table: response,
        entry: Number(entry._sum.amount),
        out: Number(out._sum.amount),
        balance: Number(entry._sum.amount) - Number(out._sum.amount),
      },
      meta: {
        page,
        perPage,
        search,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    }
  }
}
