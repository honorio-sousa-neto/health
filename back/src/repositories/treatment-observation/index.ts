import { TreatmentObservation, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { TCreateTreatmentObservation, TUpdateTreatmentObservation } from "../../validator/treatment-obervation.validator";
export class TreatmentObservationRepository {
    async create(createTreatmentObservation: TCreateTreatmentObservation): Promise<TreatmentObservation | null>{
        return prisma.treatmentObservation.create({ data: createTreatmentObservation })
    }
    async update(treatmentObservationWhereUniqueInput: Prisma.TreatmentObservationWhereUniqueInput, updateTreatmentObservation: TUpdateTreatmentObservation): Promise<TreatmentObservation | null> {
        return prisma.treatmentObservation.update({ where: treatmentObservationWhereUniqueInput, data: updateTreatmentObservation })
    }
    async index(params: {
        take?: number,
        skip?: number,
        cursor?: Prisma.TreatmentObservationWhereUniqueInput,
        where?: Prisma.TreatmentObservationWhereInput,
        orderBy?: Prisma.TreatmentObservationOrderByWithAggregationInput,
        include?: Prisma.TreatmentObservationInclude
    }): Promise<TreatmentObservation[]> {
        const { skip, take, cursor, where, orderBy, include } = params;
        return prisma.treatmentObservation.findMany({
          skip,
          take,
          cursor,
          where,
          orderBy,
          include
        });
    }
    async show (params: {treatmentObservationWhereUniqueInput: Prisma.TreatmentObservationWhereUniqueInput, include?: Prisma.TreatmentObservationInclude}): Promise<TreatmentObservation | null> {
        const { treatmentObservationWhereUniqueInput, include } = params
        return prisma.treatmentObservation.findUnique({ where: treatmentObservationWhereUniqueInput, include })
    }
    async destroy (treatmentObservationWhereUniqueInput: Prisma.TreatmentObservationWhereUniqueInput): Promise<TreatmentObservation | null> {
        return prisma.treatmentObservation.delete({ where: treatmentObservationWhereUniqueInput })
    }
    async count (treatmentObservationWhereUniqueInput?: Prisma.TreatmentObservationWhereInput): Promise<number> {
        return prisma.treatmentObservation.count({ where: treatmentObservationWhereUniqueInput })
    }

}
