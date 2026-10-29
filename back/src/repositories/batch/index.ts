import { BatchProduct, Prisma, MovimentationStock } from "@prisma/client";
import { prisma } from "../../database/prisma";
export class BatchRepository {
  async show(
    batchProductWhereUniqueInput: Prisma.BatchProductWhereUniqueInput,
    include: Prisma.BatchProductInclude
  ): Promise<BatchProduct | null> {
    return prisma.batchProduct.findUnique({
      where: batchProductWhereUniqueInput,
      include,
    });
  }
  async index(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BatchProductWhereUniqueInput;
    where?: Prisma.BatchProductWhereInput;
    orderBy?: Prisma.BatchProductOrderByWithRelationInput;
    include?: Prisma.BatchProductInclude;
  }): Promise<BatchProduct[]> {
    return prisma.batchProduct.findMany(params);
  }
  async count(params: {
    where?: Prisma.BatchProductWhereInput;
  }): Promise<number> {
    return prisma.batchProduct.count(params);
  }
  async update(param: Prisma.BatchProductUpdateArgs): Promise<BatchProduct> {
    return prisma.batchProduct.update(param);
  }
}

export class MovimentationStockRepository {
  async show(
    movimentationStockWhereUniqueInput: Prisma.MovimentationStockWhereUniqueInput,
    include: Prisma.MovimentationStockInclude
  ): Promise<MovimentationStock | null> {
    return prisma.movimentationStock.findUnique({
      where: movimentationStockWhereUniqueInput,
      include,
    });
  }
  async index(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.MovimentationStockWhereUniqueInput;
    where?: Prisma.MovimentationStockWhereInput;
    orderBy?: Prisma.MovimentationStockOrderByWithRelationInput;
  }): Promise<MovimentationStock[]> {
    return prisma.movimentationStock.findMany(params);
  }
  async count(params: {
    where?: Prisma.MovimentationStockWhereInput;
  }): Promise<number> {
    return prisma.movimentationStock.count(params);
  }
}
