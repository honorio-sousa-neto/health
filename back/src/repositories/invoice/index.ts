import { Category, Invoice, InvoiceStatus, InvoiceType } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { IRepository, Meta } from "../../types/global.interfaces";
import {
  TCreateInvoice,
  TUpdateInvoice,
} from "../../validator/invoice.validator";

export class InvoiceRepository
  implements IRepository<Invoice, TCreateInvoice, TUpdateInvoice>
{
  async index(payload: {
    search?: string;
    page: number;
    perPage: number;
    category?: string;
  }): Promise<Meta<Invoice[]>> {
    const { page, perPage, search, category } = payload;
    const skip = (page - 1) * perPage;

    const invoices = await prisma.invoice.findMany({
      take: perPage,
      skip: skip,
      where: search
        ? {
            AND: [
              {
                reference: { contains: search, mode: "insensitive" },
              },
              {
                type: category as InvoiceType,
              },
            ],
          }
        : { type: category as InvoiceType },
      include: {
        customer: true,
        invoiceSource: {
          include: {
            customer: { select: { name: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const total = await prisma.invoice.count({
      where: search
        ? {
            AND: [
              {
                reference: { contains: search, mode: "insensitive" },
              },
              {
                type: category as InvoiceType,
              },
            ],
          }
        : { type: category as InvoiceType },
    });
    return {
      data: invoices,
      meta: {
        page,
        perPage,
        search,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }
  async indexByStatus(payload: {
    search?: string;
    page: number;
    perPage: number;
    status?: string;
  }): Promise<Meta<Invoice[]>> {
    const { page, perPage, search, status } = payload;
    const skip = (page - 1) * perPage;
    const invoices = await prisma.invoice.findMany({
      take: perPage,
      skip: skip,
      where: search
        ? {
            AND: [
              {
                reference: { contains: search, mode: "insensitive" },
              },
              status == "PAGO"
                ? {
                    OR: [
                      {
                        type: "FR",
                      },
                      {
                        type: "RC",
                      },
                    ],
                  }
                : {
                    status: status as InvoiceStatus,
                  },
            ],
          }
        : {
            AND: [
              status == "PAGO"
                ? {
                    OR: [
                      {
                        type: "FR",
                      },
                      {
                        type: "RC",
                      },
                    ],
                  }
                : {
                    status: status as InvoiceStatus,
                  },
            ],
          },
      include: {
        customer: true,
        invoiceSource: {
          include: {
            customer: { select: { name: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const total = await prisma.invoice.count({
      where: {
        AND: [
          status == "PAGO"
            ? {
                OR: [
                  {
                    type: "FR",
                  },
                  {
                    type: "RC",
                  },
                ],
              }
            : {
                status: status as InvoiceStatus,
              },
        ],
      },
    });
    return {
      data: invoices,
      meta: {
        page,
        perPage,
        search,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }
  async show(id: string): Promise<Meta<Invoice>> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        invoiceItems: { include: { service: true } },
        customer: {
          include: {
            customersInsurance: { include: { insurance: true } },
            Partner: true,
            protocol: true,
          },
        },
        payment: true,
        user: true,
        invoiceSource: {
          include: {
            customer: {
              include: {
                customersInsurance: {
                  include: {
                    insurance: true,
                  },
                },
                Partner: true,
                protocol: true,
              },
            },

            invoiceItems: { include: { service: true } },
          },
        },
      },
    });
    return { data: invoice };
  }
  async create(payload: TCreateInvoice): Promise<Meta<Invoice>> {
    const { invoiceItems, emission_date, invoiceId, amount_received, ...rest } =
      payload;
    let invoice: Invoice;
    if (
      invoiceItems?.length &&
      (payload.type == "FR" || payload.type == "FT" || payload.type == "PP")
    ) {
      invoice = await prisma.invoice.create({
        data: {
          emission_date: payload.emission_date
            ? new Date(payload.emission_date)
            : new Date(),
          amount_received: payload.amount_received,
          invoiceId: payload.invoiceId || null,
          invoiceItems: {
            createMany: {
              data: invoiceItems.map((item) => ({
                discount: item.discount ?? 0,
                price: item.price,
                quantity: item.quantity,
                serviceId: item.serviceId,
                total: item.total,
              })),
            },
          },
          ...rest,
        },
      });
    } else if (payload.type == "NC") {
      invoice = await prisma.invoice.create({
        data: {
          emission_date: payload.emission_date
            ? new Date(payload.emission_date)
            : new Date(),
          invoiceId: payload.invoiceId || null,
          ...rest,
        },
      });
      if (invoiceId)
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "FINAL",
          },
        });
    } else {
      invoice = await prisma.invoice.create({
        data: {
          emission_date: payload.emission_date
            ? new Date(payload.emission_date)
            : new Date(),
          ...rest,
          invoiceId,
          amount_received,
        },
        include: {
          invoiceSource: true,
        },
      });
      if (invoiceId)
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "FINAL",
          },
        });
    }
    return { data: invoice };
  }
  async filter(search: string): Promise<Meta<Invoice[]>> {
    const invoices = await prisma.invoice.findMany({
      where: {
        AND: [
          {
            reference: { contains: search },
          },
          {
            type: "FT",
          },
          {
            status: "POR_PAGAR",
          },
        ],
      },
      include: {
        customer: {
          include: {
            customersInsurance: true,
            protocol: true,
            Partner: true,
          },
        },
        invoiceItems: {
          include: { service: { select: { name: true, description: true } } },
        },
      },
    });

    return { data: invoices };
  }
  async invoiceFromInsurance(
    payload: {
      search?: string;
      page: number;
      perPage: number;
      orderBy?: any;
      category?: string;
    },
    insuranceId: string,
    statusOfDocument: string
  ): Promise<Meta<Invoice[]>> {
    const { page, perPage, search, orderBy } = payload;
    const skip = (page - 1) * perPage;

    const invoices = await prisma.invoice.findMany({
      where: search
        ? {
            AND: [
              {
                reference: { contains: search, mode: "insensitive" },
              },

              (statusOfDocument as InvoiceStatus) == "PAGO"
                ? {
                    OR: [
                      {
                        type: "FR",
                      },
                      {
                        type: "RC",
                      },
                    ],
                  }
                : {
                    type: "FT",
                  },
            ],
          }
        : {
            AND: [
              (statusOfDocument as InvoiceStatus) == "PAGO"
                ? {
                    OR: [
                      {
                        type: "FR",
                      },
                      {
                        type: "RC",
                      },
                    ],
                  }
                : {
                    type: "FT",
                  },
            ],
          },
      include: {
        customer: true,
        user: true,
      },
      take: perPage,
      skip: skip,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.invoice.count({
      where: search
        ? {
            AND: [
              {
                reference: { contains: search, mode: "insensitive" },
              },

              {
                status: statusOfDocument as InvoiceStatus,
              },
            ],
          }
        : {
            AND: [
              {
                status: statusOfDocument as InvoiceStatus,
              },
            ],
          },
    });
    return {
      data: invoices,
      meta: {
        page,
        perPage,
        search,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }
  async invoiceFromCustomer(
    payload: {
      search?: string;
      page: number;
      perPage: number;
      orderBy?: any;
      category?: string;
    },
    customerId: string,
    statusOfDocument: string
  ): Promise<Meta<Invoice[]>> {
    const { page, perPage, search, orderBy } = payload;
    const skip = (page - 1) * perPage;

    const invoices = await prisma.invoice.findMany({
      where: search
        ? {
            AND: [
              {
                reference: { contains: search, mode: "insensitive" },
              },
              {
                customerId,
              },
              (statusOfDocument as InvoiceStatus) == "PAGO"
                ? {
                    OR: [
                      {
                        type: "FR",
                      },
                      {
                        type: "RC",
                      },
                    ],
                  }
                : {
                    AND: [
                      {
                        type: "FT",
                      },
                      {
                        status: "POR_PAGAR",
                      },
                    ],
                  },
            ],
          }
        : {
            AND: [
              {
                customerId,
              },
              (statusOfDocument as InvoiceStatus) == "PAGO"
                ? {
                    OR: [
                      {
                        type: "FR",
                      },
                      {
                        type: "RC",
                      },
                    ],
                  }
                : {
                    AND: [
                      {
                        type: "FT",
                      },
                      {
                        status: "POR_PAGAR",
                      },
                    ],
                  },
            ],
          },
      include: {
        customer: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.invoice.count({
      where: search
        ? {
            AND: [
              {
                reference: { contains: search, mode: "insensitive" },
              },
              {
                customerId,
              },
              {
                status: statusOfDocument as InvoiceStatus,
              },
            ],
          }
        : {
            AND: [
              {
                customerId,
              },
              {
                status: statusOfDocument as InvoiceStatus,
              },
            ],
          },
    });
    return {
      data: invoices,
      meta: {
        page,
        perPage,
        search,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }
  async invoicesByMonth(month: number, year: number): Promise<Meta<Invoice[]>> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const invoices = await prisma.invoice.findMany({
      where: {
        emission_date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        OR: [
          {
            status: "POR_PAGAR",
          },
          {
            status: "PAGO",
          },
        ],
      },
      include: {
        customer: {
          include: {
            Partner: true,
            protocol: true,
            customersInsurance: true,
          },
        },
        payment: {
          select: {
            name: true,
          },
        },
      },
    });

    return { data: invoices };
  }
  async invoicesByCategoryOfService(
    payload: {
      search?: string;
      page: number;
      perPage: number;
      orderBy?: any;
      day?: number;
      month: number;
      year: number;
    },
    category: Category
  ): Promise<Meta<Invoice[]>> {
    const { start, end } = payload.day
      ? this.getDayRange(payload.year, payload.month, payload.day)
      : this.getMonthRange(payload.year, payload.month);

    const { page, perPage, search } = payload;
    const skip = (page - 1) * perPage;
    const invoices = await prisma.invoice.findMany({
      take: perPage,
      skip: skip,
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
              // some: {
              //   service: {
              //     category: category,
              //   },
              // },
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
      include: {
        customer: true,
      },
    });
    const total = await prisma.invoice.count({
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
              // some: {
              //   service: {
              //     category: category,
              //   },
              // },
            },
          },
          {
            reference: search || {},
          },

          {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        ],
      },
    });
    return {
      data: invoices,
      meta: {
        page,
        perPage,
        search,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }
  getDayRange(
    year: number,
    month: number,
    day: number
  ): { start: Date; end: Date } {
    const start = new Date(year, month - 1, day, 0, 0, 0, 0);
    const end = new Date(year, month - 1, day, 23, 59, 59, 999);
    return { start, end };
  }

  getMonthRange(year: number, month: number): { start: Date; end: Date } {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return { start, end };
  }
  update(id: string, payload: TUpdateInvoice): Promise<Meta<Invoice>> {
    throw new Error("Method not implemented.");
  }
  softDelete(id: string): Promise<Meta<Invoice>> {
    throw new Error("Method not implemented.");
  }
  destroy(id: string): Promise<Meta<Invoice>> {
    throw new Error("Method not implemented.");
  }
}
