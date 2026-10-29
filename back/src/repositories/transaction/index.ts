import { prisma } from "../../database/prisma";

export class TransactionRepository {
  async addStock(productId: string, amount: number) {
    await prisma.service.findUniqueOrThrow({ where: { id: productId } });
    return prisma.movimentationStock.create({
      data: { productId, quantity: amount, type: "ENTRY" },
    });
  }

  async subtractStock(productId: string, amount: number) {
    await prisma.service.findUniqueOrThrow({ where: { id: productId } });
    return prisma.movimentationStock.create({
      data: { productId, quantity: amount, type: "OUT" },
    });
  }

  async reportMonthly(month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59);
    const rows = await prisma.movimentationStock.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const map = new Map<string, { productId: string; name: string; entry: number; out: number }>();
    for (const r of rows) {
      if (!map.has(r.productId)) {
        map.set(r.productId, { productId: r.productId, name: (r as any).product?.name ?? "", entry: 0, out: 0 });
      }
      const item = map.get(r.productId)!;
      if (r.type === "ENTRY") item.entry += r.quantity;
      else item.out += r.quantity;
    }
    return Array.from(map.values());
  }
}
