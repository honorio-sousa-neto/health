import { Ambulatory } from "@prisma/client";
import { AmbulatoryRepository } from "../../repositories/ambulatory";
import {
  TCreateAmbulatory,
  TUpdateAmbulatory,
  createAmbulatory,
  updateAmbulatory,
} from "../../validator/ambulatory.validator";

export class AmbulatoryController {
  constructor(private readonly repository: AmbulatoryRepository) {}
  async index(params: {
    search: string;
    perPage: string;
    page: string;
  }): Promise<{
    data: Ambulatory[];
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
        status: "OPEN",
      },
      include: {
        consultation: {
          include: {
            screening: {
              include: {
                customer: true,
              },
            },
            prescriptions: {
              include: {
                items: {
                  include: {
                    service: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const total = await this.repository.count({});

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

  async show(id: string): Promise<{
    data: Ambulatory | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      ambulatoryWhereUniqueInput: { id },
      include: {
        consultation: {
          include: {
            screening: {
              include: {
                customer: true,
              },
            },
            prescriptions: {
              where: {
                type: "AMBULATORY",
              },
              include: {
                items: {
                  include: {
                    service: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateAmbulatory): Promise<{
    data: Ambulatory | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createAmbulatory.parse(createData);
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
    updateData: TUpdateAmbulatory
  ): Promise<{
    data: Ambulatory | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateAmbulatory.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
}
