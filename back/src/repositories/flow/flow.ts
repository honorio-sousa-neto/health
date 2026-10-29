import { Flow, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { TCreateFlow, TUpdateFlow } from "../../validator/flow.validator";
export class FlowRepository {
  async create(createFlow: TCreateFlow): Promise<Flow | null> {
    return prisma.flow.create({ data: createFlow });
  }
  async update(
    flowWhereUniqueInput: Prisma.FlowWhereUniqueInput,
    updateFlow: TUpdateFlow
  ): Promise<Flow | null> {
    return prisma.flow.update({
      where: flowWhereUniqueInput,
      data: updateFlow,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.FlowWhereUniqueInput;
    where?: Prisma.FlowWhereInput;
    orderBy?: Prisma.FlowOrderByWithAggregationInput;
  }): Promise<Flow[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return prisma.flow.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }
  async show(params: {
    flowWhereUniqueInput: Prisma.FlowWhereUniqueInput;
  }): Promise<Flow | null> {
    const { flowWhereUniqueInput } = params;
    return prisma.flow.findUnique({
      where: flowWhereUniqueInput,
    });
  }
  async destroy(
    flowWhereUniqueInput: Prisma.FlowWhereUniqueInput
  ): Promise<Flow | null> {
    return prisma.flow.delete({ where: flowWhereUniqueInput });
  }
  async count(flowWhereUniqueInput?: Prisma.FlowWhereInput): Promise<number> {
    return prisma.flow.count({ where: flowWhereUniqueInput });
  }

  async aggregateEntryOut(params: {
    where: Prisma.FlowWhereInput;
  }): Promise<{ _sum: { amount: number | null } | null }> {
    const { where } = params;
    return prisma.flow.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });
  }
}
