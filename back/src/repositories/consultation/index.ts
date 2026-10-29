import { Consultation, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateConsultation,
  TUpdateConsultation,
} from "../../validator/consultation.validator";
export class ConsultationRepository {
  async create(
    createConsultation: TCreateConsultation
  ): Promise<Consultation | null> {
    return prisma.consultation.create({
      data: createConsultation,
    });
  }
  async update(
    consultationWhereUniqueInput: Prisma.ConsultationWhereUniqueInput,
    updateConsultation: Prisma.ConsultationUpdateInput,
    include?: Prisma.ConsultationInclude
  ): Promise<Consultation | null> {
    return prisma.consultation.update({
      where: consultationWhereUniqueInput,
      data: updateConsultation,
      include,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.ConsultationWhereUniqueInput;
    where?: Prisma.ConsultationWhereInput;
    orderBy?: Prisma.ConsultationOrderByWithAggregationInput;
    include?: Prisma.ConsultationInclude;
  }): Promise<Consultation[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.consultation.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    consultationWhereUniqueInput: Prisma.ConsultationWhereUniqueInput;
    include?: Prisma.ConsultationInclude;
  }): Promise<Consultation | null> {
    const { consultationWhereUniqueInput, include } = params;
    return prisma.consultation.findUnique({
      where: consultationWhereUniqueInput,
      include,
    });
  }
  async destroy(
    consultationWhereUniqueInput: Prisma.ConsultationWhereUniqueInput
  ): Promise<Consultation | null> {
    return prisma.consultation.delete({ where: consultationWhereUniqueInput });
  }
  async count(
    consultationWhereUniqueInput?: Prisma.ConsultationWhereInput
  ): Promise<number> {
    return prisma.consultation.count({ where: consultationWhereUniqueInput });
  }

  async byCustomer(customerId: string) {
    return prisma.consultation.findMany({
      where: { screening: { customerId }, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        status: true,
        stage: true,
      },
    });
  }
}
