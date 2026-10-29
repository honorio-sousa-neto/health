import { Flow } from "@prisma/client";
import { FlowRepository } from "../../repositories/flow/flow";
import {
  TCreateFlow,
  TUpdateFlow,
  createFlow,
  updateFlow,
} from "../../validator/flow.validator";

export class FlowController {
  constructor(private readonly repository: FlowRepository) {}
  async index(
    params: {
      perPage?: string;
      page?: string;
    },
    destination: string
  ): Promise<{
    data: Flow[];
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
    const { page, perPage } = params;
    const data = await this.repository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? Number(page) - 1 : undefined,
      orderBy: {
        createdAt: "desc",
      },
      where: { destination },
    });

    const total = await this.repository.count({ destination });

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
      meta: {
        total,
        totalPages: Math.ceil(total / Number(perPage)),
        page: Number(page),
        perPage: Number(perPage),
      },
    };
  }

  async show(id: string): Promise<{
    data: Flow | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      flowWhereUniqueInput: { id },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateFlow): Promise<{
    data: Flow | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createFlow.parse(createData);
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
    updateData: TUpdateFlow
  ): Promise<{
    data: Flow | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateFlow.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
  async aggregateData(destination: string): Promise<{
    data: { balance: number; entry: number; out: number };
    message: string;
    statusCode: number;
    success: boolean;
  }> {
    const entry = await this.repository.aggregateEntryOut({
      where: {
        destination,
        type: "ENTRY",
      },
    });
    const out = await this.repository.aggregateEntryOut({
      where: {
        destination,
        type: "OUT",
      },
    });

    return {
      data: {
        balance: Number(entry._sum?.amount) - Number(out._sum?.amount),
        entry: Number(entry._sum?.amount),
        out: Number(out._sum?.amount),
      },
      message: "Sucesso",
      statusCode: 200,
      success: true,
    };
  }
}
