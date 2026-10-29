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
    return prisma.consultation.create({ data: createConsultation });
  }
  async update(
    consultationWhereUniqueInput: Prisma.ConsultationWhereUniqueInput,
    updateConsultation: TUpdateConsultation
  ): Promise<Consultation | null> {
    let data: Consultation | null = null;
    return data;
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
}
