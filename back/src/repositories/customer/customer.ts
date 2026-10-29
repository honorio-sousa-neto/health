import { Customer, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateCustomer,
  TUpdateCustomer,
} from "../../validator/customer.validator";
export class CustomerRepository {
  async create(createCustomer: TCreateCustomer): Promise<Customer | null> {
    return prisma.customer.create({ data: createCustomer });
  }
  async update(
    customerWhereUniqueInput: Prisma.CustomerWhereUniqueInput,
    updateCustomer: TUpdateCustomer
  ): Promise<Customer | null> {
    return prisma.customer.update({
      where: customerWhereUniqueInput,
      data: updateCustomer,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.CustomerWhereUniqueInput;
    where?: Prisma.CustomerWhereInput;
    orderBy?: Prisma.CustomerOrderByWithAggregationInput;
    include?: Prisma.CustomerInclude;
  }): Promise<Customer[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.customer.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    customerWhereUniqueInput: Prisma.CustomerWhereUniqueInput;
    include?: Prisma.CustomerInclude;
  }): Promise<Customer | null> {
    const { customerWhereUniqueInput, include } = params;
    return prisma.customer.findUnique({
      where: customerWhereUniqueInput,
      include,
    });
  }
  async destroy(
    customerWhereUniqueInput: Prisma.CustomerWhereUniqueInput
  ): Promise<Customer | null> {
    return prisma.customer.delete({ where: customerWhereUniqueInput });
  }
  async count(
    customerWhereUniqueInput?: Prisma.CustomerWhereInput
  ): Promise<number> {
    return prisma.customer.count({ where: customerWhereUniqueInput });
  }
}
