import { Partner, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreatePartner,
  TUpdatePartner,
} from "../../validator/partner.validator";
export class PartnerRepository {
  async create(createPartner: TCreatePartner): Promise<Partner | null> {
    return prisma.partner.create({ data: createPartner });
  }
  async update(
    partnerWhereUniqueInput: Prisma.PartnerWhereUniqueInput,
    updatePartner: TUpdatePartner
  ): Promise<Partner | null> {
    return prisma.partner.update({
      where: partnerWhereUniqueInput,
      data: updatePartner,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.PartnerWhereUniqueInput;
    where?: Prisma.PartnerWhereInput;
    orderBy?: Prisma.PartnerOrderByWithAggregationInput;
    include?: Prisma.PartnerInclude;
  }): Promise<Partner[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.partner.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    partnerWhereUniqueInput: Prisma.PartnerWhereUniqueInput;
    include?: Prisma.PartnerInclude;
  }): Promise<Partner | null> {
    const { partnerWhereUniqueInput, include } = params;
    return prisma.partner.findUnique({
      where: partnerWhereUniqueInput,
      include,
    });
  }
  async destroy(
    partnerWhereUniqueInput: Prisma.PartnerWhereUniqueInput
  ): Promise<Partner | null> {
    return prisma.partner.delete({ where: partnerWhereUniqueInput });
  }
  async count(
    partnerWhereUniqueInput?: Prisma.PartnerWhereInput
  ): Promise<number> {
    return prisma.partner.count({ where: partnerWhereUniqueInput });
  }
}
