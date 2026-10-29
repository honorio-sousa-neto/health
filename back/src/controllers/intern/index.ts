import { Intern, Invoice } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { InternRepository } from "../../repositories/intern";
import { InvoiceRepository } from "../../repositories/invoice/invoice";
import {
  TCreateIntern,
  TUpdateIntern,
  createIntern,
  updateIntern,
} from "../../validator/intern.validator";

export class InternController {
  constructor(private readonly repository: InternRepository) {}
  private readonly invoiceRepository = new InvoiceRepository();
  async index(): Promise<{
    data: Intern[];
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
    const data = await this.repository.index({
      where: {
        deletedAt: null,
      },
      include: {
        services: {
          include: {
            category: {
              include: {
                category: true,
                Service: true,
              },
            },
          },
        },
      },
    });

    return {
      data,
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async invoicesIntern(params: {
    search?: string;
    perPage?: string;
    page?: string;
    internId: string;
    customerId: string;
  }): Promise<{
    data: Invoice[];
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search, internId, customerId } = params;
    const data = await this.invoiceRepository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? Number(page) - 1 : undefined,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        customerId,
        internId,
      },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async invoicesParticular(params: {
    search?: string;
    perPage?: string;
    page?: string;
    customerId: string;
  }): Promise<{
    data: Invoice[];
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search, customerId } = params;
    const data = await this.invoiceRepository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? Number(page) - 1 : undefined,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        customerId,
        asNormal: true,
      },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async show(id: string): Promise<{
    data: Intern | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const customerIntern = await prisma.customerIntern.findUnique({
      where: { id },
      include: {
        intern: true,
      },
    });
    const data = await this.repository.show({
      internWhereUniqueInput: { id: customerIntern?.intern.id },
      include: {
        services: {
          include: {
            category: {
              include: {
                Service: true,
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

  async create(createData: TCreateIntern): Promise<{
    data: Intern | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = createIntern.parse(createData);
    const { services, ...rest } = payload;
    const data = await this.repository.create({
      ...rest,
      services: {
        createMany: {
          data: services.map((item) => ({ categoryId: item })),
        },
      },
    });
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async update(
    id: string,
    updateData: TUpdateIntern
  ): Promise<{
    data: Intern | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateIntern.parse(updateData);
    const { services, ...rest } = payload;
    const response = await this.repository.update(
      { id },
      {
        services: {
          set: [],
        },
      }
    );

    if (!response) throw new Error("Algo de errado aconteceu");
    const data = await this.repository.update(
      { id },
      { ...rest, services: { connect: services.map((item) => ({ id: item })) } }
    );
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
  async softDelete(id: string): Promise<{
    data: Intern | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.softDelete({ id });
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
}
