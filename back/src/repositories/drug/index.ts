import { Drugs, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { TCreateDrug, TUpdateDrug } from "../../validator/drug.validator";

export class DrugRepository {
  async create(createDrug: TCreateDrug): Promise<Drugs | null> {
    return prisma.drugs.create({ data: createDrug });
  }
  async update(
    drugWhereUniqueInput: Prisma.DrugsWhereUniqueInput,
    updateDrug: TUpdateDrug
  ): Promise<Drugs | null> {
    return prisma.drugs.update({
      where: drugWhereUniqueInput,
      data: updateDrug,
    });
  }
  async destroy(
    drugWhereUniqueInput: Prisma.DrugsWhereUniqueInput
  ): Promise<Drugs | null> {
    return prisma.drugs.delete({ where: drugWhereUniqueInput });
  }
  async softDelete(
    drugWhereUniqueInput: Prisma.DrugsWhereUniqueInput
  ): Promise<Drugs | null> {
    return prisma.drugs.update({
      where: drugWhereUniqueInput,
      data: { deletedAt: new Date() },
    });
  }
  async show(
    drugWhereUniqueInput: Prisma.DrugsWhereUniqueInput
  ): Promise<Drugs | null> {
    return prisma.drugs.findUnique({ where: drugWhereUniqueInput });
  }
  async index(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.DrugsWhereUniqueInput;
    where?: Prisma.DrugsWhereInput;
    orderBy?: Prisma.DrugsOrderByWithRelationInput;
  }): Promise<Drugs[]> {
    return prisma.drugs.findMany(params);
  }
  async count(params: { where?: Prisma.DrugsWhereInput }): Promise<number> {
    return prisma.drugs.count(params);
  }
}
