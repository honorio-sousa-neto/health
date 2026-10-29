import { prisma } from "../../database/prisma";
import { groupByCategoryAndSum, groupByPaymentAndSum } from "./util";
type Service = {
  category: {
    id: string;
    name: string;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  } | null;
};

type InvoiceItem = {
  service: Service;
  total: number;
  price: number;
  quantity: number;
};

type Invoice = {
  invoiceItems: InvoiceItem[];
};

type CategoryTotal = {
  id: string;
  category: string;
  total: number;
};

export class BalanceController {
  async aggregateInvoiceCategories(
    invoices: Invoice[]
  ): Promise<CategoryTotal[]> {
    const categoryMap: { [key: string]: number } = {};
    const categoryList = await prisma.category.findMany({
      select: { id: true, name: true },
    });

    for (const invoice of invoices) {
      for (const item of invoice.invoiceItems) {
        const category = item.service.category?.parentId;
        if (!category) continue;
        const total = item.price * item.quantity;
        if (categoryMap[category]) {
          categoryMap[category] += total;
        } else {
          categoryMap[category] = total;
        }
      }
    }

    const result: CategoryTotal[] = [];
    for (const category in categoryMap) {
      if (categoryMap.hasOwnProperty(category)) {
        result.push({
          id: category,
          category:
            categoryList.find((item) => item.id == category)?.name || "",
          total: categoryMap[category],
        });
      }
    }

    return result;
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
  async show(type: string, range: string) {
    try {
      const [year, month, day] = range.split("-");
      const { start, end } =
        type == "mensal"
          ? this.getMonthRange(Number(year), Number(month))
          : this.getDayRange(Number(year), Number(month), Number(day));
      // Apenas FT e FR — documentos que têm itens.
      // RC não tem itens; está representado pela sua FT original (FINAL).
      const invoices = await prisma.invoice.findMany({
        where: {
          emission_date: { gte: start, lte: end },
          OR: [
            { type: "FT", status: "POR_PAGAR" },   // FT não paga
            { type: "FT", status: "FINAL" },        // FT paga (via RC)
            { type: "FR", status: "PAGO" },         // FR — fatura + recibo em um
          ],
        },
        select: {
          // Pagamento directo (FR)
          payment: { select: { name: true, code: true } },
          // Pagamento via RC (FT FINAL): buscar o RC que liquidou esta FT
          invoiceCurrent: {
            select: { payment: { select: { name: true, code: true } } },
          },
          invoiceItems: {
            select: {
              service: {
                select: { category: { include: { category: true } } },
              },
              total: true,
              price: true,
              quantity: true,
              discount: true,
              invoiceId: true,
              serviceId: true,
            },
          },
        },
      });
      return {
        categories: groupByCategoryAndSum(invoices as any),
        payments: groupByPaymentAndSum(invoices as any),
      };
    } catch (error: any) {
      console.log(error.message);
      throw error;
    }
  }

  setIntervalDate(type: string, from: string, to: string, range: string) {
    if (type == "range") {
      const start = new Date(from);
      const end = new Date(to);

      // Início: dia anterior às 17:00
      const realStart = new Date(start);
      realStart.setDate(realStart.getDate() - 1);
      realStart.setHours(17, 0, 0, 0);

      // Fim: dia final às 16:59
      const realEnd = new Date(end);
      realEnd.setHours(16, 59, 0, 0);

      return { realStart, realEnd };
    }
    console.log("RANGE", range);
    const d = new Date(range);

    // Início: dia anterior às 17:00
    const realStart = new Date(d);
    realStart.setDate(realStart.getDate() - 1);
    realStart.setHours(17, 0, 0, 0);

    // Fim: mesmo dia às 16:59
    const realEnd = new Date(d);
    realEnd.setHours(16, 59, 0, 0);

    return { realStart, realEnd };
  }
  async showReport(type: string, range: string, from: string, to: string) {
    try {
      const { realEnd, realStart } = this.setIntervalDate(
        type,
        from,
        to,
        range
      );

      console.log("REAL START", realStart);
      const invoices = await prisma.invoice.findMany({
        where: {
          emission_date: {
            gte: realStart,
            lte: realEnd,
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
        select: {
          customer: {
            include: { customersInsurance: true, protocol: true },
          },
          invoiceItems: {
            select: {
              service: {
                select: {
                  category: { include: { category: true } },
                  name: true,
                },
              },
              total: true,
              price: true,
              quantity: true,
              invoiceId: true,
              serviceId: true,
            },
          },
        },
      });
      // const result = this.aggregateInvoiceCategories(invoices);
      return invoices;
    } catch (error: any) {
      console.log(error.message);
      throw error;
    }
  }
}
