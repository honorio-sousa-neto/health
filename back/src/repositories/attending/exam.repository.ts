import { ExamResult } from "@prisma/client";
import { IRepository, Meta } from "../../types/global.interfaces";
import {
  TCreateExamResult,
  TUpdateExamResult,
} from "../../validator/result-exam.validator";

import { prisma } from "../../database/prisma";

export class ExamResultRepository
  implements IRepository<ExamResult, TCreateExamResult, TUpdateExamResult>
{
  async index(payload: {
    search?: string;
    page: number;
    perPage: number;
  }): Promise<Meta<ExamResult[]>> {
    const { page, perPage, search } = payload;
    const skip = (page - 1) * perPage;

    const examResult = await prisma.examResult.findMany({
      take: perPage,
      skip: skip,
      include: {
        analyst: true,
        exam: true,
      },
      where: search
        ? {
            AND: [],
          }
        : {
            AND: [],
          },
    });
    const total = await prisma.examResult.count({
      where: search
        ? {
            AND: [],
          }
        : {
            AND: [],
          },
    });
    return {
      data: examResult,
      meta: {
        page,
        perPage,
        search,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async show(id: string): Promise<Meta<ExamResult>> {
    const examResult = await prisma.examResult.findUnique({
      where: { id },
      include: {
        analyst: true,
        exam: true,
      },
    });

    return {
      data: examResult,
    };
  }

  async create(payload: TCreateExamResult): Promise<Meta<ExamResult>> {
    const examResults = await prisma.examResult.createManyAndReturn({
      data: payload.results.map(({ id, ...rest }) => ({ ...rest })),
    });

    return { data: examResults[0] };
  }

  async update(
    id: string,
    payload: TUpdateExamResult
  ): Promise<Meta<ExamResult>> {
    throw new Error("HHHHHH");
  }

  async softDelete(id: string): Promise<Meta<ExamResult>> {
    throw new Error("HHHHHH");
  }

  async destroy(id: string): Promise<Meta<ExamResult>> {
    const examResult = await prisma.examResult.delete({
      where: { id },
    });
    return { data: examResult };
  }
}
