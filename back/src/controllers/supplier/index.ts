import { Supplier } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { SupplierRepository } from "../../repositories/supplier";
import {
  TCreateSupplier,
  TUpdateSupplier,
  createSupplier,
  updateSupplier,
} from "../../validator/supplier.validator";
import { z } from "zod";

/**
 * Sem isto, um `parse` que falha rejeita a promessa do handler — e o Express 4
 * não apanha rejeições de handlers assíncronos, portanto nunca responde. O
 * pedido fica pendurado até ao timeout do cliente, sem erro nenhum a dizê-lo.
 */
const mensagemDeErro = (erro: unknown): string => {
  if (erro instanceof z.ZodError) return erro.issues[0]?.message ?? "Dados inválidos";
  console.error("[suppliers]", erro);
  return "Não foi possível gravar o fornecedor.";
};

export class SupplierController {
  constructor(private readonly repository: SupplierRepository) {}

  async index(params: { search?: string; page?: number; perPage?: number } = {}): Promise<{
    data: Supplier[];
    meta: { totalPages: number; total: number; search?: string; perPage: number; page: number };
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const page = Number(params.page) || 1;
    const perPage = Number(params.perPage) || 50;
    const search = params.search ?? "";

    const where = search
      ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { nif: { contains: search, mode: "insensitive" as const } }] }
      : {};

    const data = await this.repository.index({
      take: perPage,
      skip: (page - 1) * perPage,
      where,
      orderBy: { name: "asc" } as any,
    });

    const total = await prisma.supplier.count({ where });

    return {
      data,
      meta: { total, totalPages: Math.ceil(total / perPage), page, perPage, search },
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async show(id: string): Promise<{ data: Supplier | null; message?: string; success?: boolean; statusCode: number }> {
    const data = await this.repository.show({ supplierWhereUniqueInput: { id } });
    return { data, message: data ? "Sucesso" : "Não encontrado", statusCode: data ? 200 : 404, success: true };
  }

  async create(createData: TCreateSupplier): Promise<{ data: Supplier | null; message?: string; success?: boolean; statusCode: number }> {
    try {
      const payload = createSupplier.parse(createData);
      const data = await this.repository.create(payload);
      return { data, message: data ? "Sucesso" : "Sem sucesso", statusCode: data ? 201 : 400, success: !!data };
    } catch (error) {
      return { data: null, message: mensagemDeErro(error), statusCode: 400, success: false };
    }
  }

  async update(id: string, updateData: TUpdateSupplier): Promise<{ data: Supplier | null; message?: string; success?: boolean; statusCode: number }> {
    try {
      const payload = updateSupplier.parse(updateData);
      const data = await this.repository.update({ id }, payload);
      return { data, message: data ? "Sucesso" : "Sem sucesso", statusCode: data ? 200 : 400, success: !!data };
    } catch (error) {
      return { data: null, message: mensagemDeErro(error), statusCode: 400, success: false };
    }
  }

  async softDelete(id: string): Promise<{ data: Supplier | null; statusCode: number; success: boolean }> {
    const data = await this.repository.update({ id }, { deletedAt: new Date() } as any);
    return { data, statusCode: 200, success: true };
  }
}
