import { Surgery, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateSurgery,
  TUpdateSurgery,
} from "../../validator/surgery.validator";
export class SurgeryRepository {
  async create(createSurgery: TCreateSurgery): Promise<Surgery | null> {
    return prisma.surgery.create({ data: createSurgery });
  }
  async update(
    surgeryWhereUniqueInput: Prisma.SurgeryWhereUniqueInput,
    updateSurgery: TUpdateSurgery
  ): Promise<Surgery | null> {
    return prisma.surgery.update({
      where: surgeryWhereUniqueInput,
      data: updateSurgery,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.SurgeryWhereUniqueInput;
    where?: Prisma.SurgeryWhereInput;
    orderBy?: Prisma.SurgeryOrderByWithAggregationInput;
    include?: Prisma.SurgeryInclude;
  }): Promise<Surgery[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.surgery.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    surgeryWhereUniqueInput: Prisma.SurgeryWhereUniqueInput;
    include?: Prisma.SurgeryInclude;
  }): Promise<Surgery | null> {
    const { surgeryWhereUniqueInput, include } = params;
    return prisma.surgery.findUnique({
      where: surgeryWhereUniqueInput,
      include,
    });
  }
  async destroy(
    surgeryWhereUniqueInput: Prisma.SurgeryWhereUniqueInput
  ): Promise<Surgery | null> {
    return prisma.surgery.delete({ where: surgeryWhereUniqueInput });
  }
  async count(
    surgeryWhereUniqueInput?: Prisma.SurgeryWhereInput
  ): Promise<number> {
    return prisma.surgery.count({ where: surgeryWhereUniqueInput });
  }

  async byCustomer(customerId: string) {
    return prisma.surgery.findMany({
      where: { customerId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        status: true,
        service: { select: { name: true } },
      },
    });
  }
}
