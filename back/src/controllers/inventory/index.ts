import { BatchRepository } from "../../repositories/batch";

const repo = new BatchRepository();

const today    = () => new Date();
const in30days = () => { const d = new Date(); d.setDate(d.getDate() + 30); return d; };

export class InventoryController {
  async index(params: { search?: string; perPage?: string; page?: string; status?: string }) {
    const { page, perPage, search, status } = params;
    const take = Number(perPage) || 20;
    const skip = Math.max(((Number(page) || 1) - 1) * take, 0);

    const where: any = {};

    if (search) {
      where.product = { name: { contains: search, mode: "insensitive" } };
    }

    if (status === "expired") {
      where.expiration = { lt: today() };
    } else if (status === "expiring") {
      where.expiration = { gte: today(), lte: in30days() };
    } else if (status === "ok") {
      where.OR = [{ expiration: { gt: in30days() } }, { expiration: null }];
    }

    const [data, total] = await Promise.all([
      repo.index({ where, take, skip, include: { product: true }, orderBy: { expiration: "asc" } }),
      repo.count({ where }),
    ]);

    return {
      data,
      meta: { total, totalPages: Math.ceil(total / take), page: Number(page) || 1, perPage: take, search },
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async show(id: string) {
    const data = await repo.show({ id }, { movimentationStock: true, product: true });
    return { data, statusCode: 200, message: "OK", success: true };
  }
}
