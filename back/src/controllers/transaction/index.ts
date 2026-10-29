import { prisma } from "../../database/prisma";
import { HttpResponse, Message, StatusCode } from "../../types/global.interfaces";

export class TransactionController {
  async addStock(id: string, amount: number): Promise<HttpResponse<any>> {
    try {
      const response = await prisma.movimentationStock.create({
        data: { productId: id, quantity: amount, type: "ENTRY" },
      });
      return { message: Message.OK, body: { data: response }, status: StatusCode.OK, success: true };
    } catch {
      return { message: Message.OK, status: StatusCode.OK, success: true };
    }
  }

  async subtractStock(id: string, amount: number): Promise<HttpResponse<any>> {
    try {
      const response = await prisma.movimentationStock.create({
        data: { productId: id, quantity: amount, type: "OUT" },
      });
      return { message: Message.OK, body: { data: response }, status: StatusCode.OK, success: true };
    } catch {
      return { message: Message.OK, status: StatusCode.OK, success: true };
    }
  }

  async reportMonthly(month: number, year: number): Promise<HttpResponse<any>> {
    try {
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 0, 23, 59, 59);
      const response = await prisma.movimentationStock.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: { product: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      });
      return { message: Message.OK, body: { data: response }, status: StatusCode.OK, success: true };
    } catch {
      return { message: Message.OK, status: StatusCode.OK, success: true };
    }
  }
}
