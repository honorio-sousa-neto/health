import { Screening, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateScreening,
  TUpdateScreening,
} from "../../validator/screening.validator";
export class ScreeningRepository {
  async create(
    createScreening: Prisma.ScreeningCreateArgs
  ): Promise<Screening | null> {
    return prisma.screening.create(createScreening);
  }
  async update(
    updateScreening: Prisma.ScreeningUpdateArgs
  ): Promise<Screening | null> {
    return prisma.screening.update(updateScreening);
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.ScreeningWhereUniqueInput;
    where?: Prisma.ScreeningWhereInput;
    orderBy?: Prisma.ScreeningOrderByWithAggregationInput;
    include?: Prisma.ScreeningInclude;
  }): Promise<Screening[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.screening.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    screeningWhereUniqueInput: Prisma.ScreeningWhereUniqueInput;
    include?: Prisma.ScreeningInclude;
  }): Promise<Screening | null> {
    const { screeningWhereUniqueInput, include } = params;
    return prisma.screening.findUnique({
      where: screeningWhereUniqueInput,
      include,
    });
  }
  async destroy(
    screeningWhereUniqueInput: Prisma.ScreeningWhereUniqueInput
  ): Promise<Screening | null> {
    return prisma.screening.delete({ where: screeningWhereUniqueInput });
  }
  async count(
    screeningWhereUniqueInput?: Prisma.ScreeningWhereInput
  ): Promise<number> {
    return prisma.screening.count({ where: screeningWhereUniqueInput });
  }
}
