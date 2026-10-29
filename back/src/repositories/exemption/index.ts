import { Exemption, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateExemption,
  TUpdateExemption,
} from "../../validator/exemption.validator";
export class ExemptionRepository {
  async create(createExemption: TCreateExemption): Promise<Exemption | null> {
    return prisma.exemption.create({ data: createExemption });
  }
  async update(
    exemptionWhereUniqueInput: Prisma.ExemptionWhereUniqueInput,
    updateExemption: TUpdateExemption
  ): Promise<Exemption | null> {
    return prisma.exemption.update({
      where: exemptionWhereUniqueInput,
      data: updateExemption,
    });
  }

  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.ExemptionWhereUniqueInput;
    where?: Prisma.ExemptionWhereInput;
    orderBy?: Prisma.ExemptionOrderByWithAggregationInput;
    include?: Prisma.ExemptionInclude;
  }): Promise<Exemption[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.exemption.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    exemptionWhereUniqueInput: Prisma.ExemptionWhereUniqueInput;
    include?: Prisma.ExemptionInclude;
  }): Promise<Exemption | null> {
    const { exemptionWhereUniqueInput, include } = params;
    return prisma.exemption.findUnique({
      where: exemptionWhereUniqueInput,
      include,
    });
  }
  async destroy(
    exemptionWhereUniqueInput: Prisma.ExemptionWhereUniqueInput
  ): Promise<Exemption | null> {
    return prisma.exemption.delete({ where: exemptionWhereUniqueInput });
  }
  async count(
    exemptionWhereUniqueInput?: Prisma.ExemptionWhereInput
  ): Promise<number> {
    return prisma.exemption.count({ where: exemptionWhereUniqueInput });
  }
}
