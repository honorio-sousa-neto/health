import {
  Category,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateInvoice,
  TUpdateInvoice,
} from "../../validator/invoice.validator";
export class InvoiceRepository {
  async create(
    createInvoice: TCreateInvoice,
    invoiceItems:
      | Pick<
          InvoiceItem,
          "discount" | "price" | "quantity" | "serviceId" | "total"
        >[]
      | undefined
  ): Promise<Invoice | null> {
    return prisma.invoice.create({
      data: {
        ...createInvoice,
        invoiceItems: {
          createMany: {
            data: invoiceItems?.map(({ discount, ...rest }) => ({ ...rest, discount: discount ?? 0 })) ?? [],
          },
        },
      },
      include: {
        invoiceSource: true,
      },
    });
  }
  async update(
    invoiceWhereUniqueInput: Prisma.InvoiceWhereUniqueInput,
    status: InvoiceStatus
  ): Promise<Invoice | null> {
    return prisma.invoice.update({
      where: invoiceWhereUniqueInput,
      data: {
        status,
      },
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.InvoiceWhereUniqueInput;
    where?: Prisma.InvoiceWhereInput;
    orderBy?: Prisma.InvoiceOrderByWithAggregationInput;
    include?: Prisma.InvoiceInclude;
  }): Promise<Invoice[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.invoice.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    invoiceWhereUniqueInput: Prisma.InvoiceWhereUniqueInput;
    include?: Prisma.InvoiceInclude;
  }): Promise<Invoice | null> {
    const { invoiceWhereUniqueInput, include } = params;
    return prisma.invoice.findUnique({
      where: invoiceWhereUniqueInput,
      include,
    });
  }
  async destroy(
    invoiceWhereUniqueInput: Prisma.InvoiceWhereUniqueInput
  ): Promise<Invoice | null> {
    return prisma.invoice.delete({ where: invoiceWhereUniqueInput });
  }
  async count(
    invoiceWhereUniqueInput?: Prisma.InvoiceWhereInput
  ): Promise<number> {
    return prisma.invoice.count({ where: invoiceWhereUniqueInput });
  }

  async getInvoiceFromInsurance(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.InvoiceWhereUniqueInput;
    where?: Prisma.InvoiceWhereInput;
    orderBy?: Prisma.InvoiceOrderByWithAggregationInput;
    include?: Prisma.InvoiceInclude;
  }): Promise<Invoice[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.invoice.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }

  async aggregateData(params: { where: Prisma.InvoiceWhereInput }): Promise<{
    _count: number | null;
    _sum: { total: number | null } | null;
    _max: { total: number | null } | null;
    _min: { total: number | null } | null;
    _avg: { total: number | null } | null;
  }> {
    const { where } = params;
    return prisma.invoice.aggregate({
      where,
      _count: true,
      _sum: {
        total: true,
      },
      _max: {
        total: true,
      },
      _min: {
        total: true,
      },
      _avg: {
        total: true,
      },
    });
  }

  // async getInvoiceByCategoryRange(params: {
  //   perPage: number;
  //   page: number;
  //   search: string;
  //   range: string;
  //   category: Category;
  // }): Promise<Invoice[]> {
  //   const { category, range, page, perPage,  } = params;
  //   const invoices = await prisma.invoice.findMany({
  //     take: perPage,
  //     skip: skip,
  //     where: {
  //       AND: [
  //         {
  //           OR: [
  //             {
  //               type: "FT",
  //             },
  //             {
  //               type: "FR",
  //             },
  //           ],
  //         },
  //         {
  //           invoiceItems: {
  //             some: {
  //               service: {
  //                 category: category,
  //               },
  //             },
  //           },
  //         },
  //         {
  //           reference: search || {},
  //         },

  //         {
  //           emission_date: {
  //             gte: start,
  //             lte: end,
  //           },
  //         },
  //       ],
  //     },
  //     include: {
  //       customer: true,
  //     },
  //   });
  //   const total = await prisma.invoice.count({
  //     where: {
  //       AND: [
  //         {
  //           OR: [
  //             {
  //               type: "FT",
  //             },
  //             {
  //               type: "FR",
  //             },
  //           ],
  //         },
  //         {
  //           invoiceItems: {
  //             some: {
  //               service: {
  //                 category: category,
  //               },
  //             },
  //           },
  //         },
  //         {
  //           reference: search || {},
  //         },

  //         {
  //           createdAt: {
  //             gte: start,
  //             lte: end,
  //           },
  //         },
  //       ],
  //     },
  //   });
  // }
}
