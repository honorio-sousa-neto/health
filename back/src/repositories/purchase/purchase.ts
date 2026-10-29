import { Purchase, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";

export class PurchaseRepository {
  async create(
    createPurchase: Prisma.PurchaseCreateArgs
  ): Promise<Purchase | null> {
    return prisma.purchase.create(createPurchase);
  }
  async update(
    updatePurchase: Prisma.PurchaseUpdateArgs
  ): Promise<Purchase | null> {
    return prisma.purchase.update(updatePurchase);
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.PurchaseWhereUniqueInput;
    where?: Prisma.PurchaseWhereInput;
    orderBy?: Prisma.PurchaseOrderByWithAggregationInput;
    include?: Prisma.PurchaseInclude;
  }): Promise<Purchase[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.purchase.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    PurchaseWhereUniqueInput: Prisma.PurchaseWhereUniqueInput;
    include?: Prisma.PurchaseInclude;
  }): Promise<Purchase | null> {
    const { PurchaseWhereUniqueInput, include } = params;
    return prisma.purchase.findUnique({
      where: PurchaseWhereUniqueInput,
      include,
    });
  }
  async destroy(
    PurchaseWhereUniqueInput: Prisma.PurchaseWhereUniqueInput
  ): Promise<Purchase | null> {
    return prisma.purchase.delete({
      where: PurchaseWhereUniqueInput,
    });
  }
  async count(
    PurchaseWhereUniqueInput?: Prisma.PurchaseWhereInput
  ): Promise<number> {
    return prisma.purchase.count({
      where: PurchaseWhereUniqueInput,
    });
  }
}
