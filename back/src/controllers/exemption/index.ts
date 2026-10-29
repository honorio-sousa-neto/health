import { Exemption } from "@prisma/client";
import { ExemptionRepository } from "../../repositories/exemption";
import {
  TCreateExemption,
  TUpdateExemption,
  createExemption,
  updateExemption,
} from "../../validator/exemption.validator";

export class ExemptionController {
  constructor(private readonly repository: ExemptionRepository) {}
  async index(): Promise<{
    data: Exemption[];
    meta?: {
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
    const data = await this.repository.index({});

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async show(id: string): Promise<{
    data: Exemption | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      exemptionWhereUniqueInput: { id },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateExemption): Promise<{
    data: Exemption | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createExemption.parse(createData);
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
    updateData: TUpdateExemption
  ): Promise<{
    data: Exemption | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateExemption.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
}
