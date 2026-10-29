import { Category, Service } from "@prisma/client";
import { CategoryRepository } from "../../repositories/category";
import {
  createCategory,
  TCreateCategory,
  TUpdateCategory,
  updateCategory,
} from "../../validator/category.validator";
import { prisma } from "../../database/prisma";
export class CategoryController {
  constructor(private readonly repository: CategoryRepository) {}

  async index(params: {
    page: number;
    perPage: number;
    search: string;
  }): Promise<{
    data: Category[];
    meta: {
      totalPages: number;
      total: number;
      search?: string;
      perPage: number;
      page: number;
    };
    message: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search } = params;
    const categories = await this.repository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? (Number(page) - 1) * Number(perPage) : undefined,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        name: {
          contains: search,
        },
      },
      include: {
        category: true,
      },
    });
    const total = await this.repository.count({
      where: {
        name: {
          contains: search,
        },
      },
    });
    const totalPages = Math.ceil(total / Number(perPage));
    return {
      data: categories,
      meta: {
        totalPages,
        total,
        search,
        perPage: Number(perPage),
        page: Number(page),
      },
      message: "Sucesso",
      statusCode: 200,
      success: true,
    };
  }
  async show(params: { id: string }): Promise<{
    data: Category | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      categoryWhereUniqueInput: { id: params.id },
      include: {
        subCategories: true,
      },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }
  async create(params: TCreateCategory): Promise<{
    data: Category;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const parsedParams = createCategory.parse(params);
    const data = await this.repository.create(parsedParams);
    return {
      data,
      message: "Sucesso",
      statusCode: 201,
      success: true,
    };
  }
  async update(
    id: string,
    params: TUpdateCategory
  ): Promise<{
    data: Category;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const parsedParams = updateCategory.parse(params);
    const data = await this.repository.update(id, parsedParams);
    return {
      data,
      message: "Sucesso",
      statusCode: 200,
      success: true,
    };
  }
  async softDelete(id: string): Promise<{
    data: Category;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.softDelete(id);
    return {
      data,
      message: "Sucesso",
      statusCode: 200,
      success: true,
    };
  }

  async destroy(id: string): Promise<{
    data: Category;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.destroy(id);
    return {
      data,
      message: "Sucesso",
      statusCode: 200,
      success: true,
    };
  }

  async observationsServices(): Promise<{
    data: Service[];
    statusCode: number;
    success: boolean;
    message: string;
  }> {
    const services = await prisma.service.findMany({
      where: {
        category: {
          name: "Observação",
        },
      },
    });

    return {
      data: services,
      message: "Sucesso",
      statusCode: 200,
      success: true,
    };
  }
}
