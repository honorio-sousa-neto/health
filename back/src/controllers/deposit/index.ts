import { Deposit } from "@prisma/client";
import { DepositRepository } from "../../repositories/deposit";
import {
  TCreateDeposit,
  TUpdateDeposit,
  createDeposit,
  updateDeposit,
} from "../../validator/deposit.validator";
import { FlowRepository } from "../../repositories/flow/flow";

export class DepositController {
  constructor(private readonly repository: DepositRepository) {}
  private readonly repositoryFlow = new FlowRepository();
  async index(params: {
    perPage?: string;
    page?: string;
    search?: string;
  }): Promise<{
    data: Deposit[];
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
    const { page, perPage, search } = params;
    const data = await this.repository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? Number(page) - 1 : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        bank: true,
      },
    });

    const total = await this.repository.count({});

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
    data: Deposit | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      depositWhereUniqueInput: { id },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateDeposit): Promise<{
    data: Deposit | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const {
      data: { balance },
    } = await this.aggregateData("Caixa");
    try {
      if (createData.amount > balance) {
        throw new Error("Esse montante não está disponível no caixa");
      }
    } catch (error: any) {
      return {
        data: null,
        message: error.message,
        statusCode: 200,
        success: false,
      };
    }
    const payload = createDeposit.parse(createData);
    const data = await this.repository.create(payload);
    if (data) {
      await this.repositoryFlow.create({
        amount: createData.amount,
        description: `Saída para depósito na conta ${
          (data as any).bank.number
        }(${(data as any).bank.name})`,
        destination: "Caixa",
        type: "OUT",
      });
      await this.repositoryFlow.create({
        amount: createData.amount,
        description: `Depósito vindo do Caixa`,
        destination: createData.bankAccountId,
        type: "ENTRY",
      });
    }

    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async update(
    id: string,
    updateData: TUpdateDeposit
  ): Promise<{
    data: Deposit | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateDeposit.parse(updateData);
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
  }> {
    const entry = await this.repositoryFlow.aggregateEntryOut({
      where: {
        destination,
        type: "ENTRY",
      },
    });
    const out = await this.repositoryFlow.aggregateEntryOut({
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
    };
  }
}
