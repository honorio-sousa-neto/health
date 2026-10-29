import { Symptoms } from '@prisma/client'
import { IRepository, Meta } from '../../types/global.interfaces'
import { TCreateSymptoms } from '../../validator/attending.validator'

import { prisma } from '../../database/prisma'

export class SymptomsRepository
  implements IRepository<Symptoms, TCreateSymptoms, TCreateSymptoms>
{
  async index(payload: { search?: string }): Promise<Meta<Symptoms[]>> {
    const { search } = payload

    const symptoms = await prisma.symptoms.findMany({
      take: 10,
      where: search
        ? {
            AND: [
              { title: { contains: search, mode: 'insensitive' } },
              { deletedAt: null },
            ],
          }
        : {
            AND: [{ deletedAt: null }],
          },
    })

    return {
      data: symptoms,
    }
  }

  async show(id: string): Promise<Meta<Symptoms>> {
    throw new Error('Not implemented')
  }

  async create(payload: TCreateSymptoms): Promise<Meta<Symptoms>> {
    const symptom = await prisma.symptoms.create({
      data: {
        ...payload,
        deletedAt: null,
      },
    })
    return { data: symptom }
  }

  async update(id: string, payload: TCreateSymptoms): Promise<Meta<Symptoms>> {
    throw new Error('Not implemented')
  }

  async softDelete(id: string): Promise<Meta<Symptoms>> {
    const symptoms = await prisma.symptoms.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return { data: symptoms }
  }

  async destroy(id: string): Promise<Meta<Symptoms>> {
    const symptoms = await prisma.symptoms.delete({
      where: { id },
    })
    return { data: symptoms }
  }
}
