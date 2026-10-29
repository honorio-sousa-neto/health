import { Screening } from "@prisma/client";
import { IRepository, Meta } from "../../types/global.interfaces";
import {
  TCreateScreening,
  TUpdateScreening,
} from "../../validator/screening.validator";

import { prisma } from "../../database/prisma";

export class ScreeningRepository
  implements IRepository<Screening, TCreateScreening, TUpdateScreening>
{
  async index(payload: {
    search?: string;
    page: number;
    perPage: number;
  }): Promise<Meta<Screening[]>> {
    const { page, perPage, search } = payload;
    const skip = (page - 1) * perPage;

    const screening = await prisma.screening.findMany({
      take: perPage,
      skip: skip,
      where: search
        ? {
            AND: [{ deletedAt: null }],
          }
        : {
            AND: [{ deletedAt: null }],
          },
    });
    const total = await prisma.screening.count({
      where: search
        ? {
            AND: [{ deletedAt: null }],
          }
        : {
            AND: [{ deletedAt: null }],
          },
    });
    return {
      data: screening,
      meta: {
        page,
        perPage,
        search,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async show(id: string): Promise<Meta<Screening>> {
    const screening = await prisma.screening.findUnique({
      where: { id },
    });

    return {
      data: screening,
    };
  }

  async create(payload: TCreateScreening): Promise<Meta<Screening>> {
    // const screening = await prisma.screening.findUnique({
    //   where: { id: payload.attendingId },
    // });

    // await prisma.screening.upsert({
    //   where: {
    //     attendingId: payload.attendingId,
    //   },
    //   create: {
    //     ...payload,
    //   },
    //   update: {
    //     ...payload,
    //   },
    // });

    // await prisma.attending.update({
    //   where: { id: payload.attendingId },
    //   data: { stage: 'CONSULTING_CLINIC' },
    // })
    return { data: null };
  }

  async update(
    id: string,
    payload: TUpdateScreening
  ): Promise<Meta<Screening>> {
    const screening = await prisma.screening.update({
      where: { id },
      data: { ...payload },
    });

    return {
      data: screening,
    };
  }

  async softDelete(id: string): Promise<Meta<Screening>> {
    const screening = await prisma.screening.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { data: screening };
  }

  async destroy(id: string): Promise<Meta<Screening>> {
    const screening = await prisma.screening.delete({
      where: { id },
    });
    return { data: screening };
  }
}
