import { Service } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { MaterialRepository } from "../../repositories/material";
import {
  TCreateMaterial,
  TUpdateMaterial,
  TUpdateMaterialQuantity,
  createMaterial,
  updateMaterial,
  updateMaterialQuantity,
} from "../../validator/material.validator";

export class MaterialController {
  constructor(private readonly repository: MaterialRepository) {}

  async index(params: { search: string; perPage: string; page: string }): Promise<{
    data: any[];
    meta: { totalPages: number; total: number; perPage: number; page: number };
    statusCode: number;
    success: boolean;
  }> {
    const { page, perPage, search } = params;
    const items = await this.repository.index({
      take: Number(perPage) || undefined,
      skip: Number(perPage) ? (Number(page) - 1) * Number(perPage) : undefined,
      where: search ? { name: { contains: search, mode: "insensitive" } } : {},
      include: { category: true, unit: true },
    });

    const data = await Promise.all(
      items.map(async (item) => {
        const agg = await prisma.movimentationStock.groupBy({
          by: ["type"],
          where: { productId: item.id },
          _sum: { quantity: true },
        });
        const entry = agg.find((r) => r.type === "ENTRY")?._sum.quantity ?? 0;
        const out   = agg.find((r) => r.type === "OUT")?._sum.quantity ?? 0;
        return { ...item, currentQuantity: Number(entry) - Number(out) };
      })
    );

    const total = await this.repository.count(
      search ? { name: { contains: search, mode: "insensitive" } } : {}
    );

    return {
      data,
      meta: { total, totalPages: Math.ceil(total / Number(perPage)), page: Number(page), perPage: Number(perPage) },
      statusCode: 200,
      success: true,
    };
  }

  async show(id: string): Promise<{ data: Service | null; statusCode: number; success: boolean }> {
    const data = await this.repository.show(id, {
      category: true,
      unit: true,
      consumables: { include: { consumable: { select: { id: true, name: true, unit_price: true } } } },
    } as any);
    return { data, statusCode: data ? 200 : 404, success: !!data };
  }

  async create(createData: TCreateMaterial): Promise<{ data: Service; statusCode: number; success: boolean; message: string }> {
    const { price, ...payload } = createMaterial.parse(createData);
    const data = await this.repository.create({
      name: payload.name,
      description: payload.description,
      type: "CONSUMABLE",
      materialCategory: payload.type,
      minimumStock: payload.minimumQuantity ?? null,
      unit_price: price ?? null,
      category: { connect: { id: payload.categoryId } },
      ...(payload.unitId ? { unit: { connect: { id: payload.unitId } } } : {}),
    } as any);
    return { data, statusCode: 201, success: true, message: "Material criado com sucesso" };
  }

  async update(id: string, updateData: TUpdateMaterial): Promise<{ data: Service; statusCode: number; success: boolean }> {
    const { price, ...payload } = updateMaterial.parse(updateData);
    const data = await this.repository.update(id, {
      ...(payload.name        && { name: payload.name }),
      ...(payload.description && { description: payload.description }),
      ...(payload.type        && { materialCategory: payload.type }),
      ...(payload.minimumQuantity !== undefined && { minimumStock: payload.minimumQuantity }),
      ...(price !== undefined  && { unit_price: price }),
      ...(payload.categoryId  && { category: { connect: { id: payload.categoryId } } }),
      ...(payload.unitId !== undefined && { unit: payload.unitId ? { connect: { id: payload.unitId } } : { disconnect: true } }),
    } as any);
    return { data, statusCode: 200, success: true };
  }

  async updateQuantity(id: string, updateData: TUpdateMaterialQuantity): Promise<{ statusCode: number; success: boolean; message: string }> {
    const payload = updateMaterialQuantity.parse(updateData);
    await prisma.movimentationStock.create({
      data: { productId: id, quantity: payload.quantity, type: payload.type },
    });
    return { statusCode: 201, success: true, message: "Stock actualizado" };
  }

  async destroy(id: string): Promise<{ statusCode: number; success: boolean }> {
    await this.repository.destroy(id);
    return { statusCode: 200, success: true };
  }
}
