import { AdministrationMedicament, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateAdministrationMedication,
  TUpdateAdministrationMedication,
} from "../../validator/administrationMedicament.validator";
export class AdministrationMedicamentRepository {
  async create(
    createAdministrationMedicament: TCreateAdministrationMedication
  ): Promise<AdministrationMedicament | null> {
    return prisma.administrationMedicament.create({
      data: createAdministrationMedicament,
    });
  }
  async update(
    administrationMedicamentWhereUniqueInput: Prisma.AdministrationMedicamentWhereUniqueInput,
    updateAdministrationMedicament: TUpdateAdministrationMedication
  ): Promise<AdministrationMedicament | null> {
    return prisma.administrationMedicament.update({
      where: administrationMedicamentWhereUniqueInput,
      data: updateAdministrationMedicament,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.AdministrationMedicamentWhereUniqueInput;
    where?: Prisma.AdministrationMedicamentWhereInput;
    orderBy?: Prisma.AdministrationMedicamentOrderByWithAggregationInput;
    include?: Prisma.AdministrationMedicamentInclude;
  }): Promise<AdministrationMedicament[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.administrationMedicament.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    administrationMedicamentWhereUniqueInput: Prisma.AdministrationMedicamentWhereUniqueInput;
    include?: Prisma.AdministrationMedicamentInclude;
  }): Promise<AdministrationMedicament | null> {
    const { administrationMedicamentWhereUniqueInput, include } = params;
    return prisma.administrationMedicament.findUnique({
      where: administrationMedicamentWhereUniqueInput,
      include,
    });
  }
  async destroy(
    administrationMedicamentWhereUniqueInput: Prisma.AdministrationMedicamentWhereUniqueInput
  ): Promise<AdministrationMedicament | null> {
    return prisma.administrationMedicament.delete({
      where: administrationMedicamentWhereUniqueInput,
    });
  }
  async count(
    administrationMedicamentWhereUniqueInput?: Prisma.AdministrationMedicamentWhereInput
  ): Promise<number> {
    return prisma.administrationMedicament.count({
      where: administrationMedicamentWhereUniqueInput,
    });
  }
}
