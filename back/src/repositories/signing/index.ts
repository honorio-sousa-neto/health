import { CustomerIntern, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";

export class CustomerInternRepository {
  async create(
    createCustomerIntern: Prisma.CustomerInternCreateArgs
  ): Promise<CustomerIntern | null> {
    return prisma.customerIntern.create(createCustomerIntern);
  }
  async update(
    updateCustomerIntern: Prisma.CustomerInternUpdateArgs
  ): Promise<CustomerIntern | null> {
    return prisma.customerIntern.update(updateCustomerIntern);
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.CustomerInternWhereUniqueInput;
    where?: Prisma.CustomerInternWhereInput;
    orderBy?: Prisma.CustomerInternOrderByWithAggregationInput;
    include?: Prisma.CustomerInternInclude;
  }): Promise<CustomerIntern[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.customerIntern.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    CustomerInternWhereUniqueInput: Prisma.CustomerInternWhereUniqueInput;
    include?: Prisma.CustomerInternInclude;
  }): Promise<CustomerIntern | null> {
    const { CustomerInternWhereUniqueInput, include } = params;
    return prisma.customerIntern.findUnique({
      where: CustomerInternWhereUniqueInput,
      include,
    });
  }
  async destroy(
    CustomerInternWhereUniqueInput: Prisma.CustomerInternWhereUniqueInput
  ): Promise<CustomerIntern | null> {
    return prisma.customerIntern.delete({
      where: CustomerInternWhereUniqueInput,
    });
  }
  async count(
    CustomerInternWhereUniqueInput?: Prisma.CustomerInternWhereInput
  ): Promise<number> {
    return prisma.customerIntern.count({
      where: CustomerInternWhereUniqueInput,
    });
  }
}
