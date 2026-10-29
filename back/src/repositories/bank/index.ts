import { BankAccount, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateBankAccount,
  TUpdateBankAccount,
} from "../../validator/bank.validator";
export class BankAccountRepository {
  async create(
    createBankAccount: TCreateBankAccount
  ): Promise<BankAccount | null> {
    return prisma.bankAccount.create({ data: createBankAccount });
  }
  async update(
    bankAccountWhereUniqueInput: Prisma.BankAccountWhereUniqueInput,
    updateBankAccount: TUpdateBankAccount
  ): Promise<BankAccount | null> {
    return prisma.bankAccount.update({
      where: bankAccountWhereUniqueInput,
      data: updateBankAccount,
    });
  }

  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.BankAccountWhereUniqueInput;
    where?: Prisma.BankAccountWhereInput;
    orderBy?: Prisma.BankAccountOrderByWithAggregationInput;
    include?: Prisma.BankAccountInclude;
  }): Promise<BankAccount[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.bankAccount.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    bankAccountWhereUniqueInput: Prisma.BankAccountWhereUniqueInput;
    include?: Prisma.BankAccountInclude;
  }): Promise<BankAccount | null> {
    const { bankAccountWhereUniqueInput, include } = params;
    return prisma.bankAccount.findUnique({
      where: bankAccountWhereUniqueInput,
      include,
    });
  }
  async destroy(
    bankAccountWhereUniqueInput: Prisma.BankAccountWhereUniqueInput
  ): Promise<BankAccount | null> {
    return prisma.bankAccount.delete({ where: bankAccountWhereUniqueInput });
  }
  async count(
    bankAccountWhereUniqueInput?: Prisma.BankAccountWhereInput
  ): Promise<number> {
    return prisma.bankAccount.count({ where: bankAccountWhereUniqueInput });
  }
}
