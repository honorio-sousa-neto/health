import { Category, MovimentationStock, Prisma, Service } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TAddStock,
  TCreateService,
  TUpdateService,
} from "../../validator/service.validator";
export class ServiceRepository {
  async create(createService: TCreateService): Promise<Service | null> {
    return prisma.service.create({ data: createService });
  }
  async update(
    serviceWhereUniqueInput: Prisma.ServiceWhereUniqueInput,
    updateService: TUpdateService
  ): Promise<Service | null> {
    return prisma.service.update({
      where: serviceWhereUniqueInput,
      data: updateService,
    });
  }
  async findAll(params: {
    where: Prisma.ServiceWhereInput;
  }): Promise<Service[]> {
    return prisma.service.findMany(params);
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.CategoryWhereUniqueInput;
    where: Prisma.CategoryWhereUniqueInput;
    orderBy?: Prisma.ServiceOrderByWithAggregationInput;
    include?: Prisma.CategoryInclude;
  }): Promise<Category | null> {
    const { skip, take, cursor, where, orderBy, include } = params;

    return prisma.category.findFirst({
      where,
      include,
    });
  }
  async indexAll(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.ServiceWhereUniqueInput;
    where: Prisma.ServiceWhereInput;
    orderBy?: Prisma.ServiceOrderByWithAggregationInput;
    include?: Prisma.ServiceInclude;
  }): Promise<Service[]> {
    const { skip, take, cursor, where, orderBy, include } = params;

    return prisma.service.findMany({
      where,
      include,
    });
  }
  async indexAlternate(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.CategoryWhereUniqueInput;
    where: Prisma.CategoryWhereInput;
    orderBy?: Prisma.ServiceOrderByWithAggregationInput;
    include?: Prisma.CategoryInclude;
  }): Promise<Category | null> {
    const { skip, take, cursor, where, orderBy, include } = params;

    return prisma.category.findFirst({
      where,
      include,
    });
  }
  async internmment(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.CategoryWhereUniqueInput;
    where: Prisma.ServiceWhereInput;
    orderBy?: Prisma.ServiceOrderByWithAggregationInput;
    include?: Prisma.CategoryInclude;
  }): Promise<Service[] | null> {
    const { skip, take, cursor, where, orderBy, include } = params;

    return prisma.service.findMany({
      where,
    });
  }

  async show(params: {
    serviceWhereUniqueInput: Prisma.ServiceWhereUniqueInput;
    include?: Prisma.ServiceInclude;
  }): Promise<Service | null> {
    const { serviceWhereUniqueInput, include } = params;
    return prisma.service.findUnique({
      where: serviceWhereUniqueInput,
      include,
    });
  }
  async destroy(
    serviceWhereUniqueInput: Prisma.ServiceWhereUniqueInput
  ): Promise<Service | null> {
    return prisma.service.delete({ where: serviceWhereUniqueInput });
  }
  async count(
    serviceWhereUniqueInput?: Prisma.ServiceWhereInput
  ): Promise<number> {
    return prisma.service.count({ where: serviceWhereUniqueInput });
  }

  async storeLogsStock(payload: TAddStock): Promise<MovimentationStock> {
    const { transactionType, ...rest } = payload;
    return prisma.movimentationStock.create({ data: { ...rest, type: transactionType } });
  }
}
