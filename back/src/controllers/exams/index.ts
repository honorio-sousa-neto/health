import { Exam } from "@prisma/client";
import { ExamRepository } from "../../repositories/exams";
import {
  TCreateExam,
  TUpdateExam,
  createExam,
  updateExam,
} from "../../validator/exams.validator";

export class ExamController {
  constructor(private readonly repository: ExamRepository) {}
  async indexAll(params: {
    search?: string;
    perPage?: string;
    page?: string;
  }): Promise<{
    data: Exam[];
    meta?: {
      totalPages: number;
      total: number;
      search?: string;
      perPage: number;
      page: number;
    };
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search } = params;
    const data = await this.repository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? Number(page) - 1 : undefined,
      include: {
        service: {
          select: {
            unit_price: true,
          },
        },
      },
    });

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }
  async index(
    params: {
      search?: string;
      perPage?: string;
      page?: string;
    },
    sectionId: string
  ): Promise<{
    data: Exam[];
    meta?: {
      totalPages: number;
      total: number;
      search?: string;
      perPage: number;
      page: number;
    };
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search } = params;
    const data = await this.repository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? Number(page) - 1 : undefined,
      where: {
        sectionId,
      },
    });

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async show(id: string): Promise<{
    data: Exam | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      examWhereUniqueInput: { id },
      include: {
        service: true,
        section: true,
      },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateExam): Promise<{
    data: Exam | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createExam.parse(createData);
    const data = await this.repository.create(payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async update(
    id: string,
    updateData: TUpdateExam
  ): Promise<{
    data: Exam | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateExam.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
}
