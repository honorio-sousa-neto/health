import { Deposit, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateDeposit,
  TUpdateDeposit,
} from "../../validator/deposit.validator";
export class DepositRepository {
  async create(createDeposit: TCreateDeposit): Promise<Deposit | null> {
    return prisma.deposit.create({
      data: createDeposit,
      include: { bank: true },
    });
  }
  async update(
    depositWhereUniqueInput: Prisma.DepositWhereUniqueInput,
    updateDeposit: TUpdateDeposit
  ): Promise<Deposit | null> {
    return prisma.deposit.update({
      where: depositWhereUniqueInput,
      data: updateDeposit,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.DepositWhereUniqueInput;
    where?: Prisma.DepositWhereInput;
    orderBy?: Prisma.DepositOrderByWithAggregationInput;
    include?: Prisma.DepositInclude;
  }): Promise<Deposit[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.deposit.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    depositWhereUniqueInput: Prisma.DepositWhereUniqueInput;
    include?: Prisma.DepositInclude;
  }): Promise<Deposit | null> {
    const { depositWhereUniqueInput, include } = params;
    return prisma.deposit.findUnique({
      where: depositWhereUniqueInput,
      include,
    });
  }
  async destroy(
    depositWhereUniqueInput: Prisma.DepositWhereUniqueInput
  ): Promise<Deposit | null> {
    return prisma.deposit.delete({ where: depositWhereUniqueInput });
  }
  async count(
    depositWhereUniqueInput?: Prisma.DepositWhereInput
  ): Promise<number> {
    return prisma.deposit.count({ where: depositWhereUniqueInput });
  }
}
