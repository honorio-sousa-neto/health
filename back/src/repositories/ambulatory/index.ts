import { Ambulatory, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateAmbulatory,
  TUpdateAmbulatory,
} from "../../validator/ambulatory.validator";
export class AmbulatoryRepository {
  async create(
    createAmbulatory: TCreateAmbulatory
  ): Promise<Ambulatory | null> {
    return prisma.ambulatory.create({
      data: createAmbulatory,
    });
  }
  async update(
    ambulatoryWhereUniqueInput: Prisma.AmbulatoryWhereUniqueInput,
    updateAmbulatory: TUpdateAmbulatory
  ): Promise<Ambulatory | null> {
    return prisma.ambulatory.update({
      where: ambulatoryWhereUniqueInput,
      data: updateAmbulatory,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.AmbulatoryWhereUniqueInput;
    where?: Prisma.AmbulatoryWhereInput;
    orderBy?: Prisma.AmbulatoryOrderByWithAggregationInput;
    include?: Prisma.AmbulatoryInclude;
  }): Promise<Ambulatory[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.ambulatory.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    ambulatoryWhereUniqueInput: Prisma.AmbulatoryWhereUniqueInput;
    include?: Prisma.AmbulatoryInclude;
  }): Promise<Ambulatory | null> {
    const { ambulatoryWhereUniqueInput, include } = params;
    return prisma.ambulatory.findUnique({
      where: ambulatoryWhereUniqueInput,
      include,
    });
  }
  async destroy(
    ambulatoryWhereUniqueInput: Prisma.AmbulatoryWhereUniqueInput
  ): Promise<Ambulatory | null> {
    return prisma.ambulatory.delete({
      where: ambulatoryWhereUniqueInput,
    });
  }
  async count(
    ambulatoryWhereUniqueInput?: Prisma.AmbulatoryWhereInput
  ): Promise<number> {
    return prisma.ambulatory.count({
      where: ambulatoryWhereUniqueInput,
    });
  }
}
