import { Section } from "@prisma/client";
import { SectionRepository } from "../../repositories/section";
import {
  TCreateSection,
  TUpdateSection,
  createSection,
  updateSection,
} from "../../validator/section.validator";

export class SectionController {
  constructor(private readonly repository: SectionRepository) {}
  async index(): Promise<{
    data: Section[];
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
    const data = await this.repository.index({
      include: {
        _count: {
          select: {
            exams: true,
          },
        },
        exams: true,
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
    data: Section | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      sectionWhereUniqueInput: { id },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateSection): Promise<{
    data: Section | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createSection.parse(createData);
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
    updateData: TUpdateSection
  ): Promise<{
    data: Section | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateSection.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
}
