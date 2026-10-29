import {
  Customer,
  CustomerInsurance,
  Insurance,
  Invoice,
  InvoiceStatus,
} from "@prisma/client";
import { InsuranceRepository } from "../../repositories/insurance";
import {
  TCreateInsurance,
  TUpdateInsurance,
  createInsurance,
  updateInsurance,
} from "../../validator/insurance.validator";
import { InvoiceRepository } from "../../repositories/invoice/invoice";
import { prisma } from "../../database/prisma";

export class InsuranceController {
  constructor(private readonly repository: InsuranceRepository) {}
  private readonly repositoryInvoice = new InvoiceRepository();
  async index(): Promise<{
    data: Insurance[];
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
    const data = await this.repository.index({ where: { deletedAt: null } });

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async show(id: string): Promise<{
    data: Insurance | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      insuranceWhereUniqueInput: { id },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateInsurance): Promise<{
    data: Insurance | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createInsurance.parse(createData);
    const data = await this.repository.create(payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async attachCustomer(
    id: string,
    payload: {
      customerId: string;
      insuranceNumber: string;
    }
  ): Promise<{
    data: CustomerInsurance | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await prisma.customerInsurance.create({
      data: {
        insuranceId: id,
        customerId: payload.customerId,
        insuranceNumber: payload.insuranceNumber,
      },
    });
    return {
      data,
      message: "Sucesso",
      statusCode: 200,
      success: true,
    };
  }
  async softDelete(id: string): Promise<{
    data: Insurance | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.update(
      { id },
      { deletedAt: new Date() }
    );
    return {
      data,
      statusCode: 200,
      message: "Sucesso",
      success: true,
    };
  }
  async detachCustomer(id: string): Promise<{
    data: CustomerInsurance | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await prisma.customerInsurance.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
    return {
      data,
      message: "Sucesso",
      statusCode: 200,
      success: true,
    };
  }
  async indexCustomers(id: string): Promise<{
    data: Insurance | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const insurance = await this.repository.show({
      insuranceWhereUniqueInput: { id },
      include: {
        customersInsurance: {
          where: {
            deletedAt: null,
          },
          include: {
            customer: true,
          },
        },
      },
    });

    return {
      data: insurance,
      message: "Sucesso",
      statusCode: 200,
      success: true,
    };
  }
  async update(
    id: string,
    updateData: TUpdateInsurance
  ): Promise<{
    data: Insurance | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateInsurance.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async getInvoices(
    params: {
      search: string;
      perPage: number;
      page: number;
      status: InvoiceStatus;
    },
    id: string
  ): Promise<{
    data: Invoice[];
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
    const { page, perPage, search, status } = params;
    const data = await this.repositoryInvoice.getInvoiceFromInsurance({
      where: {
        status,
        asNormal: false,
        insuranceId: id,
        customer: {
          OR: [
            {
              name: search
                ? { contains: search, mode: "insensitive" }
                : { contains: "", mode: "insensitive" },
            },
          ],
        },
      },
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? Number(page) - 1 : undefined,
      include: {
        customer: true,
      },
    });
    const total = await this.repositoryInvoice.count({
      status,
      insuranceId: id,
      customer: {
        OR: [
          {
            name: search
              ? { contains: search, mode: "insensitive" }
              : { contains: "", mode: "insensitive" },
          },
        ],
      },
    });
    return {
      data,
      statusCode: 200,
      message: data ? "Sucesso" : "Sem sucesso",
      success: true,
      meta: {
        total,
        totalPages: Math.ceil(total / Number(perPage)),
        search,
        page: Number(page),
        perPage: Number(perPage),
      },
    };
  }

  async getDebtAndPaidInvoices(
    id: string,
    status: InvoiceStatus
  ): Promise<{
    data: {
      sum: number | undefined | null;
      average: number | undefined | null;
      maximum: number | undefined | null;
      minimun: number | undefined | null;
      count: number | null;
      insurance?: Pick<Insurance, "id" | "name">;
    };
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const response = await this.repositoryInvoice.aggregateData({
      where: {
        insuranceId: id,
        status,
        asNormal: false,
      },
    });

    const insurance = await this.repository.show({
      insuranceWhereUniqueInput: { id },
    });
    return {
      data: {
        average: response._avg?.total,
        sum: response._sum?.total,
        maximum: response._max?.total,
        minimun: response._min?.total,
        count: response._count,
        insurance: {
          id: insurance?.id as string,
          name: insurance?.name as string,
        },
      },
      message: "Sucesso",
      statusCode: 200,
      success: true,
    };
  }
}
