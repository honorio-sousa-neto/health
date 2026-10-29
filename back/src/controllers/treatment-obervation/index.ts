import { TreatmentObservation } from "@prisma/client";
import { TreatmentObservationRepository } from "../../repositories/treatment-observation";
import {
  TCreateTreatmentObservation,
  TUpdateTreatmentObservation,
  createTreatmentObservation,
  updateTreatmentObservation,
} from "../../validator/treatment-obervation.validator";

export class TreatmentObservationController {
  constructor(private readonly repository: TreatmentObservationRepository) {}
  async index(params: {
    search: string;
    perPage: string;
    page: string;
  }): Promise<{
    data: TreatmentObservation[];
    meta: {
      totalPages: number;
      total: number;
      search?: string;
      perPage: number;
      page: number;
    };
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search } = params;
    const data = await this.repository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? Number(page) - 1 : undefined,
      where: {
        OR: [
          {
            name: search
              ? { contains: search, mode: "insensitive" }
              : { contains: "", mode: "insensitive" },
          },
          {
            description: search
              ? { contains: search, mode: "insensitive" }
              : { contains: "", mode: "insensitive" },
          },
        ],
      },
      include: {
        service: {
          select: {
            unit_price: true,
          },
        },
      },
    });
    const total = await this.repository.count({
      OR: [
        {
          name: search ? { contains: search, mode: "insensitive" } : {},
        },
        {
          description: search ? { contains: search, mode: "insensitive" } : {},
        },
      ],
    });

    return {
      data,
      meta: {
        total,
        totalPages: Math.ceil(total / Number(perPage)),
        search,
        page: Number(page),
        perPage: Number(perPage),
      },
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async show(
    id: string
  ): Promise<{
    data: TreatmentObservation | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      treatmentObservationWhereUniqueInput: { id },
      include: { service: true },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(
    createData: TCreateTreatmentObservation
  ): Promise<{
    data: TreatmentObservation | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createTreatmentObservation.parse(createData);
    const data = await this.repository.create(payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async update(
    id: string,
    updateData: TUpdateTreatmentObservation
  ): Promise<{
    data: TreatmentObservation | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateTreatmentObservation.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
}
