import { Supplier, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateSupplier,
  TUpdateSupplier,
} from "../../validator/supplier.validator";
export class SupplierRepository {
  async create(createSupplier: TCreateSupplier): Promise<Supplier | null> {
    return prisma.supplier.create({ data: createSupplier });
  }
  async update(
    supplierWhereUniqueInput: Prisma.SupplierWhereUniqueInput,
    updateSupplier: TUpdateSupplier
  ): Promise<Supplier | null> {
    return prisma.supplier.update({
      where: supplierWhereUniqueInput,
      data: updateSupplier,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.SupplierWhereUniqueInput;
    where?: Prisma.SupplierWhereInput;
    orderBy?: Prisma.SupplierOrderByWithAggregationInput;
    include?: Prisma.SupplierInclude;
  }): Promise<Supplier[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.supplier.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    supplierWhereUniqueInput: Prisma.SupplierWhereUniqueInput;
    include?: Prisma.SupplierInclude;
  }): Promise<Supplier | null> {
    const { supplierWhereUniqueInput, include } = params;
    return prisma.supplier.findUnique({
      where: supplierWhereUniqueInput,
      include,
    });
  }
  async destroy(
    supplierWhereUniqueInput: Prisma.SupplierWhereUniqueInput
  ): Promise<Supplier | null> {
    return prisma.supplier.delete({ where: supplierWhereUniqueInput });
  }
  async count(
    supplierWhereUniqueInput?: Prisma.SupplierWhereInput
  ): Promise<number> {
    return prisma.supplier.count({ where: supplierWhereUniqueInput });
  }
}
