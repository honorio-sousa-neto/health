import { Protocol } from "@prisma/client";
import { ProtocolRepository } from "../../repositories/protocol";
import {
  TCreateProtocol,
  TUpdateProtocol,
  createProtocol,
  updateProtocol,
} from "../../validator/protocol.validator";

export class ProtocolController {
  constructor(private readonly repository: ProtocolRepository) {}
  async index(params: {
    search: string;
    perPage: string;
    page: string;
  }): Promise<{
    data: Protocol[];
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
      orderBy: {
        value: "asc",
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
    data: Protocol | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      protocolWhereUniqueInput: { id },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateProtocol): Promise<{
    data: Protocol | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createProtocol.parse(createData);
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
    updateData: TUpdateProtocol
  ): Promise<{
    data: Protocol | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateProtocol.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
}
