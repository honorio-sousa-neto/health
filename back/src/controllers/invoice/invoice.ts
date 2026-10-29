import {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  InvoiceType,
} from "@prisma/client";
import { prisma } from "../../database/prisma";
import { InvoiceRepository } from "../../repositories/invoice/invoice";
import { getDayRange, getMonthRange } from "./utils";

export class InvoiceController {
  constructor(private readonly repository: InvoiceRepository) {}

  async index(params: {
    search?: string;
    perPage?: string;
    page?: string;
    type: InvoiceType;
  }): Promise<{
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
    const { page, perPage, search, type } = params;
    const data = await this.repository.index({
      take: Math.min(100, Math.max(1, Number(perPage) || 25)),
      skip: (Math.max(1, Number(page) || 1) - 1) * Math.min(100, Math.max(1, Number(perPage) || 25)),
      orderBy: {
        createdAt: "desc",
      },
      where: {
        AND: [
          {
            reference: search
              ? { contains: search, mode: "insensitive" }
              : { contains: "", mode: "insensitive" },
          },
          {
            type,
          },
        ],
      },
      include: {
        customer: {
          select: { name: true },
        },
        invoiceSource: {
          include: {
            customer: true,
          },
        },
        invoiceItems: {
          include: {
            service: true,
          },
        },
      },
    });
    const total = await this.repository.count({
      AND: [
        {
          reference: search
            ? { contains: search, mode: "insensitive" }
            : { contains: "", mode: "insensitive" },
        },
        {
          type,
        },
      ],
    });

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
  async indexByStatus(params: {
    search?: string;
    perPage?: string;
    page?: string;
    status: InvoiceStatus;
  }): Promise<{
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
    const data = await this.repository.index({
      take: Math.min(100, Math.max(1, Number(perPage) || 25)),
      skip: (Math.max(1, Number(page) || 1) - 1) * Math.min(100, Math.max(1, Number(perPage) || 25)),
      orderBy: {
        createdAt: "desc",
      },
      where: {
        AND: [
          {
            reference: search
              ? { contains: search, mode: "insensitive" }
              : { contains: "", mode: "insensitive" },
          },
          {
            status,
          },
        ],
      },
      include: {
        customer: {
          select: { name: true },
        },
        invoiceSource: {
          include: {
            customer: true,
          },
        },
      },
    });
    const total = await this.repository.count({
      AND: [
        {
          reference: search
            ? { contains: search, mode: "insensitive" }
            : { contains: "", mode: "insensitive" },
        },
        {
          status,
        },
      ],
    });

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
    data: Invoice | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      invoiceWhereUniqueInput: { id },
    });
    return {
      data,
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async update(
    id: string,
    updateData: InvoiceStatus
  ): Promise<{
    data: Invoice | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.update({ id }, updateData);
    return {
      data,
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }

  async getInvoicesByCategoryOfService(params: {
    perPage: number;
    page: number;
    search: string;
    range: string;
    categoryId: string;
  }): Promise<{
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
    const { categoryId, page, perPage, range, search } = params;
    const [year, month, day] = range.split("-");

    let start: Date;
    let end: Date;

    if (day) {
      const { start: startDate, end: endDate } = getDayRange(
        Number(year),
        Number(month),
        Number(day)
      );
      start = startDate;
      end = endDate;
    } else {
      const { start: startDate, end: endDate } = getMonthRange(
        Number(year),
        Number(month)
      );
      start = startDate;
      end = endDate;
    }

    const data = await this.repository.index({
      include: {
        customer: true,
        invoiceItems: {
          include: {
            service: {
              include: {
                category: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        AND: [
          {
            OR: [
              {
                type: "FT",
              },
              {
                type: "FR",
              },
            ],
          },
          {
            invoiceItems: {
              some: {
                service: {
                  category: {
                    category: {
                      id: categoryId,
                    },
                  },
                },
              },
            },
          },
          {
            reference: search || {},
          },

          {
            emission_date: {
              gte: start,
              lte: end,
            },
          },
        ],
      },
    });

    const total = await this.repository.count({
      AND: [
        {
          OR: [
            {
              type: "FT",
            },
            {
              type: "FR",
            },
          ],
        },
        {
          invoiceItems: {
            some: {
              service: {
                categoryId,
              },
            },
          },
        },
        {
          reference: search || {},
        },

        {
          emission_date: {
            gte: start,
            lte: end,
          },
        },
      ],
    });

    return {
      data,
      statusCode: 200,
      message: data ? "Sucesso" : "Sem sucesso",
      meta: {
        total,
        totalPages: Math.ceil(total / Number(perPage)),
        search,
        page: Number(page),
        perPage: Number(perPage),
      },
      success: true,
    };
  }
}
