import { Visit, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { TCreateVisit, TUpdateVisit } from "../../validator/visit.validator";
export class VisitRepository {
  async create(createVisit: TCreateVisit): Promise<Visit | null> {
    return prisma.visit.create({ data: createVisit });
  }
  async update(
    visitWhereUniqueInput: Prisma.VisitWhereUniqueInput,
    updateVisit: TUpdateVisit
  ): Promise<Visit | null> {
    return prisma.visit.update({
      where: visitWhereUniqueInput,
      data: updateVisit,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.VisitWhereUniqueInput;
    where?: Prisma.VisitWhereInput;
    orderBy?: Prisma.VisitOrderByWithAggregationInput;
    include?: Prisma.VisitInclude;
  }): Promise<Visit[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.visit.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    visitWhereUniqueInput: Prisma.VisitWhereUniqueInput;
    include?: Prisma.VisitInclude;
  }): Promise<Visit | null> {
    const { visitWhereUniqueInput, include } = params;
    return prisma.visit.findUnique({ where: visitWhereUniqueInput, include });
  }
  async destroy(
    visitWhereUniqueInput: Prisma.VisitWhereUniqueInput
  ): Promise<Visit | null> {
    return prisma.visit.delete({ where: visitWhereUniqueInput });
  }
  async count(visitWhereUniqueInput?: Prisma.VisitWhereInput): Promise<number> {
    return prisma.visit.count({ where: visitWhereUniqueInput });
  }
}
