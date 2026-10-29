import { Category, Prisma, PrismaClient } from "@prisma/client";
import {
  TCreateCategory,
  TUpdateCategory,
} from "../../validator/category.validator";
import { prisma } from "../../database/prisma";

export class CategoryRepository {
  async create(data: TCreateCategory): Promise<Category> {
    return await prisma.category.create({ data });
  }

  async update(id: string, data: TUpdateCategory): Promise<Category> {
    return await prisma.category.update({ where: { id }, data });
  }

  async destroy(id: string): Promise<Category> {
    return await prisma.category.delete({ where: { id } });
  }

  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.CategoryWhereUniqueInput;
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithAggregationInput;
    include?: Prisma.CategoryInclude;
  }): Promise<Category[]> {
    return await prisma.category.findMany(params);
  }

  async show(params: {
    categoryWhereUniqueInput: Prisma.CategoryWhereUniqueInput;
    include?: Prisma.CategoryInclude;
  }): Promise<Category | null> {
    return await prisma.category.findUnique({
      where: params.categoryWhereUniqueInput,
      include: params.include,
    });
  }

  async softDelete(id: string): Promise<Category> {
    return await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  async count(params: { where?: Prisma.CategoryWhereInput }): Promise<number> {
    return await prisma.category.count({ where: params.where });
  }
}
