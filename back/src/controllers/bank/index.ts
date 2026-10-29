import { BankAccount } from "@prisma/client";
import { BankAccountRepository } from "../../repositories/bank";
import {
  TCreateBankAccount,
  TUpdateBankAccount,
  createBankAccount,
  updateBankAccount,
} from "../../validator/bank.validator";

export class BankAccountController {
  constructor(private readonly repository: BankAccountRepository) {}
  async index(): Promise<{
    data: BankAccount[];
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
    data: BankAccount | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      bankAccountWhereUniqueInput: { id },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateBankAccount): Promise<{
    data: BankAccount | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createBankAccount.parse(createData);
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
    updateData: TUpdateBankAccount
  ): Promise<{
    data: BankAccount | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateBankAccount.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async destroy(id: string): Promise<{
    data: BankAccount | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.destroy({ id });
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 200 : 400,
      success: Boolean(data),
    };
  }
}
