import { Observation, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateObservation,
  TUpdateObservation,
} from "../../validator/observation.validator";
export class ObservationRepository {
  async create(
    createObservation: TCreateObservation
  ): Promise<Observation | null> {
    const { exams, serum, ...rest } = createObservation;
    return prisma.observation.create({
      data: {
        ...rest,
        ...(serum !== undefined && { serum: serum as Prisma.InputJsonValue }),
      },
    });
  }
  async update(
    protocolWhereUniqueInput: Prisma.ObservationWhereUniqueInput,
    updateObservation: TUpdateObservation
  ): Promise<Observation | null> {
    const { serum, ...rest } = updateObservation;
    return prisma.observation.update({
      where: protocolWhereUniqueInput,
      data: {
        ...rest,
        ...(serum !== undefined && { serum: serum as Prisma.InputJsonValue }),
      },
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.ObservationWhereUniqueInput;
    where?: Prisma.ObservationWhereInput;
    orderBy?: Prisma.ObservationOrderByWithAggregationInput;
    include?: Prisma.ObservationInclude;
  }): Promise<Observation[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.observation.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    protocolWhereUniqueInput: Prisma.ObservationWhereUniqueInput;
    include?: Prisma.ObservationInclude;
  }): Promise<Observation | null> {
    const { protocolWhereUniqueInput, include } = params;
    return prisma.observation.findUnique({
      where: protocolWhereUniqueInput,
      include,
    });
  }
  async destroy(
    protocolWhereUniqueInput: Prisma.ObservationWhereUniqueInput
  ): Promise<Observation | null> {
    return prisma.observation.delete({ where: protocolWhereUniqueInput });
  }
  async count(
    protocolWhereUniqueInput?: Prisma.ObservationWhereInput
  ): Promise<number> {
    return prisma.observation.count({ where: protocolWhereUniqueInput });
  }

  async byCustomer(customerId: string) {
    return prisma.observation.findMany({
      where: { consultation: { screening: { customerId } }, deletedAt: null },
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
