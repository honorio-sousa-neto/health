import { Partner } from "@prisma/client";
import { PartnerRepository } from "../../repositories/partner";
import {
  TCreatePartner,
  TUpdatePartner,
  createPartner,
  updatePartner,
} from "../../validator/partner.validator";

export class PartnerController {
  constructor(private readonly repository: PartnerRepository) {}
  async index(): Promise<{
    data: Partner[];
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
    data: Partner | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      partnerWhereUniqueInput: { id },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreatePartner): Promise<{
    data: Partner | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createPartner.parse(createData);
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
    updateData: TUpdatePartner
  ): Promise<{
    data: Partner | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updatePartner.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
}
