import { prisma } from "../../database/prisma";

export class FinanceRepository {
  async receipt(): Promise<{ toReceive: number; received: number }> {
    const toReceive = await prisma.invoice.aggregate({
      where: { AND: [{ status: "POR_PAGAR" }] },
      _sum: {
        total: true,
      },
    });
    const received = await prisma.invoice.aggregate({
      where: { status: "PAGO" },
      _sum: {
        total: true,
      },
    });
    return {
      toReceive: toReceive?._sum.total || 0,
      received: received?._sum.total || 0,
    };
  }
}
