import { Hospitalization, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { TCreateHospitalization, TUpdateHospitalization } from "../../validator/hospitalization.validator";
export class HospitalizationRepository {
    async create(createHospitalization: TCreateHospitalization): Promise<Hospitalization | null>{
        return prisma.hospitalization.create({ data: createHospitalization })
    }
    async update(hospitalizationWhereUniqueInput: Prisma.HospitalizationWhereUniqueInput, updateHospitalization: TUpdateHospitalization): Promise<Hospitalization | null> {
        return prisma.hospitalization.update({ where: hospitalizationWhereUniqueInput, data: updateHospitalization })
    }
    async index(params: {
        take?: number,
        skip?: number,
        cursor?: Prisma.HospitalizationWhereUniqueInput,
        where?: Prisma.HospitalizationWhereInput,
        orderBy?: Prisma.HospitalizationOrderByWithAggregationInput,
        include?: Prisma.HospitalizationInclude
    }): Promise<Hospitalization[]> {
        const { skip, take, cursor, where, orderBy, include } = params;
        return prisma.hospitalization.findMany({
          skip,
          take,
          cursor,
          where,
          orderBy,
          include,
        });
    }
    async show (params: {hospitalizationWhereUniqueInput: Prisma.HospitalizationWhereUniqueInput, include?: Prisma.HospitalizationInclude}): Promise<Hospitalization | null> {
        const { hospitalizationWhereUniqueInput, include } = params
        return prisma.hospitalization.findUnique({ where: hospitalizationWhereUniqueInput, include })
    }
    async destroy (hospitalizationWhereUniqueInput: Prisma.HospitalizationWhereUniqueInput): Promise<Hospitalization | null> {
        return prisma.hospitalization.delete({ where: hospitalizationWhereUniqueInput })
    }
    async count (hospitalizationWhereUniqueInput?: Prisma.HospitalizationWhereInput): Promise<number> {
        return prisma.hospitalization.count({ where: hospitalizationWhereUniqueInput })
    }

}
