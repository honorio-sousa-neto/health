import { Company } from "@prisma/client";
import { CompanyRepository } from "../../repositories/company";
import {
  TCreateCompany,
  TUpdateCompany,
  createCompany,
  updateCompany,
} from "../../validator/company.validator";

export class CompanyController {
  constructor(private readonly repository: CompanyRepository) {}
  async index(): Promise<{
    data: Company[];
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
    data: Company | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      companyWhereUniqueInput: { id },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateCompany): Promise<{
    data: Company | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createCompany.parse(createData);
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
    updateData: TUpdateCompany
  ): Promise<{
    data: Company | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateCompany.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async upsert(upsertData: TCreateCompany): Promise<{
    data: Company | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { data: companies } = await this.index();
    const existing = companies?.[0];
    if (existing) return this.update(existing.id, upsertData);
    return this.create(upsertData);
  }
}
