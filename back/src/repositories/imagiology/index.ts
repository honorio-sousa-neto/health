import { Imagiology, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateImagiology,
  TUpdateImagiology,
} from "../../validator/imagiology.validator";
export class ImagiologyRepository {
  async create(
    createImagiology: TCreateImagiology
  ): Promise<Imagiology | null> {
    return prisma.imagiology.create({ data: createImagiology });
  }
  async update(
    imagiologyWhereUniqueInput: Prisma.ImagiologyWhereUniqueInput,
    updateImagiology: TUpdateImagiology
  ): Promise<Imagiology | null> {
    return prisma.imagiology.update({
      where: imagiologyWhereUniqueInput,
      data: updateImagiology,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.ImagiologyWhereUniqueInput;
    where?: Prisma.ImagiologyWhereInput;
    orderBy?: Prisma.ImagiologyOrderByWithAggregationInput;
    include?: Prisma.ImagiologyInclude;
  }): Promise<Imagiology[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.imagiology.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    imagiologyWhereUniqueInput: Prisma.ImagiologyWhereUniqueInput;
    include?: Prisma.ImagiologyInclude;
  }): Promise<Imagiology | null> {
    const { imagiologyWhereUniqueInput, include } = params;
    return prisma.imagiology.findUnique({
      where: imagiologyWhereUniqueInput,
      include,
    });
  }
  async destroy(
    imagiologyWhereUniqueInput: Prisma.ImagiologyWhereUniqueInput
  ): Promise<Imagiology | null> {
    return prisma.imagiology.delete({ where: imagiologyWhereUniqueInput });
  }
  async count(
    imagiologyWhereUniqueInput?: Prisma.ImagiologyWhereInput
  ): Promise<number> {
    return prisma.imagiology.count({ where: imagiologyWhereUniqueInput });
  }
}
