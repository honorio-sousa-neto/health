import { Insurance, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateInsurance,
  TUpdateInsurance,
} from "../../validator/insurance.validator";
export class InsuranceRepository {
  async create(createInsurance: TCreateInsurance): Promise<Insurance | null> {
    return prisma.insurance.create({ data: createInsurance });
  }
  async update(
    insuranceWhereUniqueInput: Prisma.InsuranceWhereUniqueInput,
    updateInsurance: TUpdateInsurance
  ): Promise<Insurance | null> {
    return prisma.insurance.update({
      where: insuranceWhereUniqueInput,
      data: updateInsurance,
    });
  }

  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.InsuranceWhereUniqueInput;
    where?: Prisma.InsuranceWhereInput;
    orderBy?: Prisma.InsuranceOrderByWithAggregationInput;
    include?: Prisma.InsuranceInclude;
  }): Promise<Insurance[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.insurance.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    insuranceWhereUniqueInput: Prisma.InsuranceWhereUniqueInput;
    include?: Prisma.InsuranceInclude;
  }): Promise<Insurance | null> {
    const { insuranceWhereUniqueInput, include } = params;
    return prisma.insurance.findUnique({
      where: insuranceWhereUniqueInput,
      include,
    });
  }
  async destroy(
    insuranceWhereUniqueInput: Prisma.InsuranceWhereUniqueInput
  ): Promise<Insurance | null> {
    return prisma.insurance.delete({ where: insuranceWhereUniqueInput });
  }
  async count(
    insuranceWhereUniqueInput?: Prisma.InsuranceWhereInput
  ): Promise<number> {
    return prisma.insurance.count({ where: insuranceWhereUniqueInput });
  }
}
