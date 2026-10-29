import { Prescription, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";

export class PrescriptionRepository {
  async create(
    createPrescription: Prisma.PrescriptionCreateInput
  ): Promise<Prescription | null> {
    return prisma.prescription.create({ data: createPrescription });
  }
  async update(
    prescriptionWhereUniqueInput: Prisma.PrescriptionWhereUniqueInput,
    updatePrescription: Prisma.PrescriptionUpdateInput
  ): Promise<Prescription | null> {
    return prisma.prescription.update({
      where: prescriptionWhereUniqueInput,
      data: updatePrescription,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.PrescriptionWhereUniqueInput;
    where?: Prisma.PrescriptionWhereInput;
    orderBy?: Prisma.PrescriptionOrderByWithAggregationInput;
    include?: Prisma.PrescriptionInclude;
  }): Promise<Prescription[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.prescription.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    prescriptionWhereUniqueInput: Prisma.PrescriptionWhereUniqueInput;
    include?: Prisma.PrescriptionInclude;
  }): Promise<Prescription | null> {
    const { prescriptionWhereUniqueInput, include } = params;
    return prisma.prescription.findUnique({
      where: prescriptionWhereUniqueInput,
      include,
    });
  }
  async destroy(
    prescriptionWhereUniqueInput: Prisma.PrescriptionWhereUniqueInput
  ): Promise<Prescription | null> {
    return prisma.prescription.delete({ where: prescriptionWhereUniqueInput });
  }
  async count(
    prescriptionWhereUniqueInput?: Prisma.PrescriptionWhereInput
  ): Promise<number> {
    return prisma.prescription.count({ where: prescriptionWhereUniqueInput });
  }
}
