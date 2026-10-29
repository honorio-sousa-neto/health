import { Payment, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreatePayment,
  TUpdatePayment,
} from "../../validator/payment.validator";
export class PaymentRepository {
  async create(createPayment: TCreatePayment): Promise<Payment | null> {
    return prisma.payment.create({ data: createPayment });
  }
  async update(
    paymentWhereUniqueInput: Prisma.PaymentWhereUniqueInput,
    updatePayment: TUpdatePayment
  ): Promise<Payment | null> {
    return prisma.payment.update({
      where: paymentWhereUniqueInput,
      data: updatePayment,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.PaymentWhereUniqueInput;
    where?: Prisma.PaymentWhereInput;
    orderBy?: Prisma.PaymentOrderByWithAggregationInput;
    include?: Prisma.PaymentInclude;
  }): Promise<Payment[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.payment.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    paymentWhereUniqueInput: Prisma.PaymentWhereUniqueInput;
    include?: Prisma.PaymentInclude;
  }): Promise<Payment | null> {
    const { paymentWhereUniqueInput, include } = params;
    return prisma.payment.findUnique({
      where: paymentWhereUniqueInput,
      include,
    });
  }
  async destroy(
    paymentWhereUniqueInput: Prisma.PaymentWhereUniqueInput
  ): Promise<Payment | null> {
    return prisma.payment.delete({ where: paymentWhereUniqueInput });
  }
  async count(
    paymentWhereUniqueInput?: Prisma.PaymentWhereInput
  ): Promise<number> {
    return prisma.payment.count({ where: paymentWhereUniqueInput });
  }
}
