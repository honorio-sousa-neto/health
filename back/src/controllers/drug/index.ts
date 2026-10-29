import { Drugs, Prisma } from "@prisma/client";
import { DrugRepository } from "../../repositories/drug";
import {
  TCreateDrug,
  TUpdateDrug,
  createDrug,
  updateDrug,
} from "../../validator/drug.validator";

export class DrugController {
  constructor(private drugRepository: DrugRepository) {}
  async index(params: {
    perPage: number;
    page: number;
    search?: string;
  }): Promise<{
    data: Drugs[];
    meta: {
      total: number;
      page: number;
      perPage: number;
      totalPages: number;
      search?: string;
    };
    message: string;
    statusCode: number;
    success: boolean;
  }> {
    const { perPage, page, search } = params;

    const data = await this.drugRepository.index({
      skip: (page - 1) * perPage,
      take: perPage,
      where: { name: { contains: search } },
    });
    const total = await this.drugRepository.count({
      where: { name: { contains: search } },
    });
    return {
      data,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        search,
      },
      message: "Data fetched successfully",
      statusCode: 200,
      success: true,
    };
  }
  async show(id: string): Promise<{
    data: Drugs | null;
    message: string;
    statusCode: number;
    success: boolean;
  }> {
    const data = await this.drugRepository.show({ id });
    return {
      data,
      message: "Data fetched successfully",
      statusCode: 200,
      success: true,
    };
  }
  async create(payload: TCreateDrug): Promise<{
    data: Drugs | null;
    message: string;
    statusCode: number;
    success: boolean;
  }> {
    const parsedSchema = createDrug.parse(payload);
    const data = await this.drugRepository.create(parsedSchema);
    return {
      data,
      message: "Data created successfully",
      statusCode: 201,
      success: true,
    };
  }
  async update(
    id: string,
    payload: TUpdateDrug
  ): Promise<{
    data: Drugs | null;
    message: string;
    statusCode: number;
    success: boolean;
  }> {
    const parsedSchema = updateDrug.parse(payload);
    const data = await this.drugRepository.update({ id }, parsedSchema);
    return {
      data,
      message: "Data updated successfully",
      statusCode: 200,
      success: true,
    };
  }
  async B(id: string): Promise<{
    data: Drugs | null;
    message: string;
    statusCode: number;
    success: boolean;
  }> {
    const data = await this.drugRepository.destroy({ id });
    return {
      data,
      message: "Data deleted successfully",
      statusCode: 200,
      success: true,
    };
  }
  async softDelete(id: string): Promise<{
    data: Drugs | null;
    message: string;
    statusCode: number;
    success: boolean;
  }> {
    const data = await this.drugRepository.softDelete({ id });
    return {
      data,
      message: "Data deleted successfully",
      statusCode: 200,
      success: true,
    };
  }
}
