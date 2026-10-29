import { Protocol, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateProtocol,
  TUpdateProtocol,
} from "../../validator/protocol.validator";
export class ProtocolRepository {
  async create(createProtocol: TCreateProtocol): Promise<Protocol | null> {
    return prisma.protocol.create({ data: createProtocol });
  }
  async update(
    protocolWhereUniqueInput: Prisma.ProtocolWhereUniqueInput,
    updateProtocol: TUpdateProtocol
  ): Promise<Protocol | null> {
    return prisma.protocol.update({
      where: protocolWhereUniqueInput,
      data: updateProtocol,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.ProtocolWhereUniqueInput;
    where?: Prisma.ProtocolWhereInput;
    orderBy?: Prisma.ProtocolOrderByWithAggregationInput;
    include?: Prisma.ProtocolInclude;
  }): Promise<Protocol[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.protocol.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    protocolWhereUniqueInput: Prisma.ProtocolWhereUniqueInput;
    include?: Prisma.ProtocolInclude;
  }): Promise<Protocol | null> {
    const { protocolWhereUniqueInput, include } = params;
    return prisma.protocol.findUnique({
      where: protocolWhereUniqueInput,
      include,
    });
  }
  async destroy(
    protocolWhereUniqueInput: Prisma.ProtocolWhereUniqueInput
  ): Promise<Protocol | null> {
    return prisma.protocol.delete({ where: protocolWhereUniqueInput });
  }
  async count(
    protocolWhereUniqueInput?: Prisma.ProtocolWhereInput
  ): Promise<number> {
    return prisma.protocol.count({ where: protocolWhereUniqueInput });
  }
}
