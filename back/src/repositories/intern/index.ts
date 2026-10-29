import { Intern, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { TCreateIntern, TUpdateIntern } from "../../validator/intern.validator";
export class InternRepository {
  async create(
    createIntern: Prisma.InternCreateWithoutCustomerInternsInput
  ): Promise<Intern | null> {
    return prisma.intern.create({ data: createIntern });
  }
  async update(
    internWhereUniqueInput: Prisma.InternWhereUniqueInput,
    updateIntern: Prisma.InternUpdateWithoutCustomerInternsInput
  ): Promise<Intern | null> {
    return prisma.intern.update({
      where: internWhereUniqueInput,
      data: updateIntern,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.InternWhereUniqueInput;
    where?: Prisma.InternWhereInput;
    orderBy?: Prisma.InternOrderByWithAggregationInput;
    include?: Prisma.InternInclude;
  }): Promise<Intern[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.intern.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    internWhereUniqueInput: Prisma.InternWhereUniqueInput;
    include?: Prisma.InternInclude;
  }): Promise<Intern | null> {
    const { internWhereUniqueInput, include } = params;
    return prisma.intern.findUnique({
      where: internWhereUniqueInput,
      include,
    });
  }
  async destroy(
    internWhereUniqueInput: Prisma.InternWhereUniqueInput
  ): Promise<Intern | null> {
    return prisma.intern.delete({ where: internWhereUniqueInput });
  }
  async softDelete(
    internWhereUniqueInput: Prisma.InternWhereUniqueInput
  ): Promise<Intern | null> {
    return prisma.intern.update({
      where: internWhereUniqueInput,
      data: { deletedAt: new Date() },
    });
  }
  async count(
    internWhereUniqueInput?: Prisma.InternWhereInput
  ): Promise<number> {
    return prisma.intern.count({ where: internWhereUniqueInput });
  }
}
